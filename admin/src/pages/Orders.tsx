import { useState, useMemo, useEffect } from "react";
import { Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { StatusBadge } from "@/components/admin/StatusBadge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { convertApiOrderToAdmin } from "@/lib/orderUtils";
import { Order, OrderStatus, PaymentStatus } from "@/types/admin";
import { format } from "date-fns";
import { toast as sonnerToast } from "sonner";

const orderStatuses: OrderStatus[] = ["created", "confirmed", "shipped", "delivered", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed"];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { toast } = useToast();

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiOrders = await api.getOrders();
      const convertedOrders = apiOrders.map(convertApiOrderToAdmin);
      setOrders(convertedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      sonnerToast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.userName.toLowerCase().includes(search.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Convert 'pending' back to 'created' for API
      const apiStatus = newStatus === 'pending' ? 'created' : newStatus;
      const updatedApiOrder = await api.updateOrderStatus(orderId, { status: apiStatus });
      const updatedOrder = convertApiOrderToAdmin(updatedApiOrder);
      
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );
      setSelectedOrder((prev) => (prev && prev.id === orderId ? updatedOrder : prev));
      
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      sonnerToast.error(error.message || "Failed to update order status");
    }
  };


  const handleUpdatePaymentStatus = async(orderId: string, newStatus: PaymentStatus) => {
    // This might not be supported by the API
    // If your API supports it, add an endpoint for it
  try {
      const updatedApiOrder = await api.updatePaymentStatus(orderId, { status: newStatus.toLocaleLowerCase() });
      const updatedOrder = convertApiOrderToAdmin(updatedApiOrder);
      
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );
      setSelectedOrder((prev) => (prev && prev.id === orderId ? updatedOrder : prev));
      
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      sonnerToast.error(error.message || "Failed to update order status");
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (order) => <span className="font-medium">{order.id.slice(0, 8)}...</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <div>
          <p className="font-medium">{order.userName}</p>
          <p className="text-sm text-muted-foreground">{order.userEmail}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {order.items.slice(0, 2).map((item, idx) => (
              <img
                key={idx}
                src={item.image}
                alt={item.productName}
                className="h-8 w-8 rounded-lg border-2 border-background object-cover"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </span>
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      key: "total",
      header: "Total",
      render: (order) => <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>,
    },
    {
      key: "orderStatus",
      header: "Order Status",
      render: (order) => <StatusBadge status={order.orderStatus} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (order) => <StatusBadge status={order.paymentStatus} />,
      className: "hidden lg:table-cell",
    },
    {
      key: "date",
      header: "Date",
      render: (order) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(order.createdAt), "MMM d, yyyy")}
        </span>
      ),
      className: "hidden lg:table-cell",
    },
    {
      key: "actions",
      header: "",
      render: (order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Manage Orders</h2>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by order ID or customer..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: orderStatuses.map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              })),
              value: statusFilter,
              onChange: setStatusFilter,
            },
            {
              key: "payment",
              label: "Payment",
              options: paymentStatuses.map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              })),
              value: paymentFilter,
              onChange: setPaymentFilter,
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatusFilter("all");
            setPaymentFilter("all");
          }}
        />

        <DataTable
          data={filteredOrders}
          columns={columns}
          emptyMessage="No orders found"
          onRowClick={(order) => setSelectedOrder(order)}
        />

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6 py-4">
                {/* Status Controls */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Order Status</Label>
                    <Select
                      value={selectedOrder.orderStatus}
                      onValueChange={(value: OrderStatus) =>
                        handleUpdateOrderStatus(selectedOrder.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={selectedOrder.paymentStatus}
                      onValueChange={(value: PaymentStatus) =>
                        handleUpdatePaymentStatus(selectedOrder.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h4 className="mb-2 font-medium">Customer</h4>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="font-medium">{selectedOrder.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.userEmail}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && selectedOrder.shippingAddress.street && (
                  <div>
                    <h4 className="mb-2 font-medium">Shipping Address</h4>
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="mb-2 font-medium">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {selectedOrder.shippingCost === 0
                        ? "Free"
                        : formatCurrency(selectedOrder.shippingCost)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium uppercase">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  {selectedOrder.razorpayPaymentId && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Razorpay ID</span>
                      <span className="text-sm font-mono">{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Created: {format(new Date(selectedOrder.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                  <span>
                    Updated: {format(new Date(selectedOrder.updatedAt), "MMM d, yyyy h:mm a")}
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
