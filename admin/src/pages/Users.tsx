import { useState, useMemo } from "react";
import { Eye, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { mockUsers, mockOrders } from "@/data/mockData";
import { User } from "@/types/admin";
import { format } from "date-fns";

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter to only show customers (not admin users)
  const customers = useMemo(() => {
    return mockUsers.filter((u) => u.role === "customer" || roleFilter === "admin");
  }, [roleFilter]);

  const filteredUsers = useMemo(() => {
    return customers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [customers, search, roleFilter]);

  const getUserOrders = (userId: string) => {
    return mockOrders.filter((order) => order.userId === userId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => <span className="text-sm">{user.phone}</span>,
      className: "hidden md:table-cell",
    },
    {
      key: "orders",
      header: "Orders",
      render: (user) => {
        const orders = getUserOrders(user.id);
        const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return (
          <div>
            <p className="font-medium">{orders.length} orders</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(total)} spent</p>
          </div>
        );
      },
      className: "hidden lg:table-cell",
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Active",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(user.lastLogin), "MMM d, yyyy")}
        </span>
      ),
      className: "hidden lg:table-cell",
    },
    {
      key: "actions",
      header: "",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Manage Users</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} users
            </p>
          </div>
        </div>

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email, or phone..."
          filters={[
            {
              key: "role",
              label: "Role",
              options: [
                { value: "customer", label: "Customer" },
                { value: "admin", label: "Admin" },
              ],
              value: roleFilter,
              onChange: setRoleFilter,
            },
          ]}
          onClear={() => {
            setSearch("");
            setRoleFilter("all");
          }}
        />

        <DataTable
          data={filteredUsers}
          columns={columns}
          emptyMessage="No users found"
          onRowClick={(user) => setSelectedUser(user)}
        />

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6 py-4">
                {/* User Profile */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone}</span>
                  </div>
                </div>

                <Separator />

                {/* Addresses */}
                {selectedUser.addresses.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium">Addresses</h4>
                    <div className="space-y-3">
                      {selectedUser.addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg bg-muted/50 p-4"
                        >
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="text-sm">
                            <p>{addr.street}</p>
                            <p>
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p>{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Order History */}
                <div>
                  <h4 className="mb-3 font-medium">Order History</h4>
                  {(() => {
                    const userOrders = getUserOrders(selectedUser.id);
                    if (userOrders.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {userOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                          >
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                              <Badge
                                variant="outline"
                                className={
                                  order.orderStatus === "delivered"
                                    ? "border-success/20 bg-success/10 text-success"
                                    : order.orderStatus === "cancelled"
                                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                                    : "border-warning/20 bg-warning/10 text-warning"
                                }
                              >
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Account Info */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Joined: {format(new Date(selectedUser.createdAt), "MMM d, yyyy")}
                  </span>
                  <span>
                    Last active: {format(new Date(selectedUser.lastLogin), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
