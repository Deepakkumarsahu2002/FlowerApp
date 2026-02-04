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
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-sage/10 animate-fade-in">
      <div className="w-full max-w-lg text-center">

        {/* SUCCESS ICON */}
        <div className="mb-10 animate-scale-in">
          <div className="relative mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-sage to-primary flex items-center justify-center shadow-xl">
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-sage" />
            </div>
          </div>

          <h1 className="mt-8 font-display text-3xl md:text-4xl font-bold text-foreground">
            Order Confirmed 🎉
          </h1>

          <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
            Thank you for your order! We’re carefully preparing your flowers with love and freshness.
          </p>
        </div>

        {/* INFO CARD */}
        <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-soft p-6 md:p-7 mb-8 text-left">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="font-semibold text-foreground">
                Estimated Delivery
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Within 5–7 business days
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                You’ll receive an SMS and email with tracking details shortly.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full text-base"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-sm text-muted-foreground">
            Redirecting in{' '}
            <span className="font-semibold text-primary">
              {countdown}
            </span>{' '}
            seconds…
          </div>
        </div>
      </div>
    </div>
  );
}
