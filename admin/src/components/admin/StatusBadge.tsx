import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | "inStock" | "outOfStock";
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Order statuses
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary border-primary/20" },
  processing: { label: "Processing", className: "bg-accent/10 text-accent border-accent/20" },
  shipped: { label: "Shipped", className: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  delivered: { label: "Delivered", className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
  
  // Payment statuses
  paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground border-muted" },
  
  // Stock statuses
  inStock: { label: "In Stock", className: "bg-success/10 text-success border-success/20" },
  outOfStock: { label: "Out of Stock", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <Badge variant="outline" className={cn("border font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
