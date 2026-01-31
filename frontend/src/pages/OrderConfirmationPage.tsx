import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="mb-8 animate-scale-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-sage/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-sage" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order! We're preparing your beautiful flowers with love and care.
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">Within 2-4 hours (Same Day)</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            You will receive an SMS and email with tracking details shortly.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Redirecting to home in <span className="font-bold text-primary">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
