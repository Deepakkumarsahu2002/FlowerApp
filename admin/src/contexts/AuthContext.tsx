import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, AdminUser as ApiAdminUser } from "@/lib/api";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert API user to admin User type
const convertUser = (apiUser: ApiAdminUser): AdminUser => ({
  id: apiUser._id,
  email: apiUser.email,
  name: apiUser.name,
  role: "admin",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem("adminUser");
    const token = localStorage.getItem("adminToken");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        // Validate that parsed user has required fields
        if (parsed && parsed.email && (parsed.name || parsed.email)) {
          // Ensure name exists, use email prefix if not
          if (!parsed.name) {
            parsed.name = parsed.email.split("@")[0];
          }
          return parsed;
        }
      } catch {
        // Invalid JSON, return null
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");
    
    if (token) {
      if (storedUser && !user) {
        // If we have stored user, set it immediately for faster UI
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
        } catch {
          // If parsing fails, fetch from API
          if (!user) {
            fetchUser();
          }
        }
      } else if (!user) {
        // Only token, no stored user - fetch from API
        fetchUser();
      } else {
        // User already set, just stop loading
        setLoading(false);
      }
    } else {
      // No token - not authenticated
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const fetchUser = async () => {
    try {
      console.log("Fetching user from API...");
      const apiUser = await api.getMe();
      console.log("User fetched successfully:", apiUser);
      const adminUser = convertUser(apiUser);
      setUser(adminUser);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      // Only clear if it's an authentication error (401/403)
      // For other errors (network, 500, etc), keep the stored user if available
      const status = error.status || (error.message?.includes("401") ? 401 : error.message?.includes("403") ? 403 : null);
      if (status === 401 || status === 403 || error.message?.includes("Unauthorized")) {
        console.log("Authentication error - clearing tokens");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setUser(null);
      } else {
        // For other errors (network, 500, etc), try to use stored user
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Using stored user due to API error (non-auth)");
            setUser(parsedUser);
          } catch {
            // If stored user is invalid, clear everything
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            setUser(null);
          }
        } else {
          // No stored user and API failed - clear tokens
          console.log("No stored user and API failed - clearing tokens");
          localStorage.removeItem("adminToken");
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Attempting login...");
      const response = await api.login({ email, password });
      console.log("Login successful, token received");
      localStorage.setItem("adminToken", response.token);
      
      // Fetch user details
      try {
        const apiUser = await api.getMe();
        console.log("User data fetched:", apiUser);
        const adminUser = convertUser(apiUser);
        setUser(adminUser);
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
      } catch (getMeError: any) {
        console.error("Failed to fetch user details after login:", getMeError);
        // If getMe fails but login succeeded, create a temporary user object
        // This allows the app to work even if getMe endpoint has issues
        const tempUser: AdminUser = {
          id: "temp",
          email: email,
          name: email.split("@")[0],
          role: "admin",
        };
        setUser(tempUser);
        localStorage.setItem("adminUser", JSON.stringify(tempUser));
        toast.error("Login successful but couldn't fetch user details. Some features may be limited.");
      }
      
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      toast.error(error.message || "Login failed. Please check your credentials and ensure the backend is running.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
