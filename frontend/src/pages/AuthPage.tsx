import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    login,
    signup,
    requestEmailVerification,
    verifyEmail,
    requestPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        const result = await signup(email, password, name, phone || undefined);
        if (result.success) {
          if (result.emailVerificationRequired) {
            toast.success('Account created. Check your email for a verification code.');
            setShowEmailVerification(true);
            setIsLogin(true);
            setVerificationEmail(email);
            return;
          }
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      // Error handling is done in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    if (!verificationEmail) {
      toast.error('Enter your email to request a verification code.');
      return;
    }
    const success = await requestEmailVerification(verificationEmail);
    if (success) {
      toast.success('Verification code sent. Please check your email.');
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationEmail || !verificationCode) {
      toast.error('Enter your email and verification code.');
      return;
    }
    const success = await verifyEmail(verificationEmail, verificationCode);
    if (success) {
      toast.success('Email verified! You can now sign in.');
      setShowEmailVerification(false);
      setVerificationCode('');
    }
  };

  const handleRequestPhoneOtp = async () => {
    if (!verificationPhone) {
      toast.error('Enter your phone number to request an OTP.');
      return;
    }
    const success = await requestPhoneOtp(verificationPhone);
    if (success) {
      toast.success('OTP sent to your phone.');
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!verificationPhone || !phoneOtp) {
      toast.error('Enter your phone number and OTP.');
      return;
    }
    const success = await verifyPhoneOtp(verificationPhone, phoneOtp);
    if (success) {
      toast.success('Phone verified successfully.');
      setShowPhoneVerification(false);
      setPhoneOtp('');
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-2xl shadow-elevated p-8 animate-scale-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-primary">Flowers</span>
              <span className="font-display text-2xl text-sage"> Forever</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin
                ? 'Sign in to continue shopping'
                : 'Join us to start your floral journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowEmailVerification(!showEmailVerification)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {showEmailVerification ? 'Hide email verification' : 'Need to verify your email?'}
              </button>
            </div>

            {showEmailVerification && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email</Label>
                  <Input
                    id="verify-email"
                    type="email"
                    placeholder="hello@example.com"
                    value={verificationEmail}
                    onChange={(e) => setVerificationEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Verification Code</Label>
                  <Input
                    id="verify-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full" onClick={handleRequestEmailVerification}>
                    Send Code
                  </Button>
                  <Button type="button" className="w-full" onClick={handleVerifyEmail}>
                    Verify Email
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPhoneVerification(!showPhoneVerification)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {showPhoneVerification ? 'Hide phone verification' : 'Verify your phone number'}
              </button>
            </div>

            {showPhoneVerification && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-phone">Phone Number</Label>
                  <Input
                    id="verify-phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={verificationPhone}
                    onChange={(e) => setVerificationPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-phone-otp">OTP</Label>
                  <Input
                    id="verify-phone-otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full" onClick={handleRequestPhoneOtp}>
                    Send OTP
                  </Button>
                  <Button type="button" className="w-full" onClick={handleVerifyPhoneOtp}>
                    Verify Phone
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
