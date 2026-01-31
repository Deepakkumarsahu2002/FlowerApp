import { useEffect, useState } from "react";
import {
  ShoppingCart,
  IndianRupee,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { api } from "@/lib/api";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(38, 92%, 50%)",
  "hsl(152, 45%, 35%)",
  "hsl(350, 55%, 65%)",
  "hsl(185, 55%, 45%)",
  "hsl(145, 60%, 40%)",
  "hsl(0, 72%, 55%)",
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenueToday: 0,
    ordersToday: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const orders = await api.getOrders();
        const products = await api.getProducts();

        const today = new Date().toDateString();

        let totalRevenue = 0;
        let revenueToday = 0;
        let ordersToday = 0;
        let pendingOrders = 0;

        const statusCount: Record<string, number> = {};
        const revenueMap: Record<string, number> = {};

        orders.forEach((order) => {
          statusCount[order.order_status] =
            (statusCount[order.order_status] || 0) + 1;

          if (order.payment_status === "paid") {
            totalRevenue += order.total_amount;

            const orderDate = new Date(order.createdAt).toDateString();
            if (orderDate === today) {
              revenueToday += order.total_amount;
              ordersToday += 1;
            }

            const day = new Date(order.createdAt).toLocaleDateString("en-IN", {
              weekday: "short",
            });
            revenueMap[day] = (revenueMap[day] || 0) + order.total_amount;
          }

          if (order.order_status === "created") {
            pendingOrders += 1;
          }
        });

        const lowStockProducts = products.filter(
          (p) => p.in_stock === false
        ).length;

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          revenueToday,
          ordersToday,
          pendingOrders,
          lowStockProducts,
        });

        setRecentOrders(orders.slice(0, 5));

        setRevenueChart(
          Object.keys(revenueMap).map((key) => ({
            name: key,
            value: revenueMap[key],
          }))
        );

        setOrdersByStatus(
          Object.keys(statusCount).map((key) => ({
            name: key,
            value: statusCount[key],
          }))
        );
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <AdminLayout title="Dashboard">Loading dashboard...</AdminLayout>;
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            variant="primary"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            variant="accent"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={Package}
            variant="success"
          />
          {/* ❌ Customers card REMOVED */}
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(stats.revenueToday)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                <p className="text-lg font-semibold">{stats.ordersToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-lg font-semibold">{stats.pendingOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-lg font-semibold">
                  {stats.lowStockProducts}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-0 shadow-soft lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Revenue Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(152, 45%, 35%)"
                      fillOpacity={0.2}
                      fill="hsl(152, 45%, 35%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Orders by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                  >
                    {ordersByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.user_id?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.order_status} />
                    <p className="font-semibold">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
