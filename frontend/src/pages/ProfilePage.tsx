import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api, Order as ApiOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, Package, Settings, LogOut, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

/* ---------------- TYPES ---------------- */

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'created' | 'shipped';
  items: number;
}

/* ---------------- COMPONENT ---------------- */

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* ---------- STATE ---------- */

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  /* ---------- AUTH GUARD ---------- */

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  /* ---------- FETCH PROFILE + ADDRESSES ---------- */

  const fetchProfile = async () => {
    try {
      const data = await api.getMyProfile();

      setProfileData({
        name: data.profile?.name || '',
        email: data.email,
        phone: data.profile?.phone || '',
      });

      setAddresses(
        data.addresses.map(addr => ({
          id: addr._id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          isDefault: addr.is_default,
        }))
      );
    } catch {
      toast.error('Failed to load profile');
    }
  };

  /* ---------- FETCH ORDERS ---------- */

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const apiOrders = await api.getMyOrders();

      setOrders(
        apiOrders.map((order: ApiOrder) => ({
          id: order._id,
          orderNumber: order.order_number,
          date: order.createdAt,
          total: order.total_amount,
          status: order.order_status as OrderHistoryItem['status'],
          items: order.items.reduce((s, i) => s + i.quantity, 0),
        }))
      );
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchOrders();
    }
  }, [isAuthenticated]);

  /* ---------- UPDATE PROFILE ---------- */

  const handleProfileUpdate = async () => {
    if (!profileData.name || !profileData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      await api.updateMyProfile({
        name: profileData.name,
        phone: profileData.phone,
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Profile update failed');
    }
  };

  /* ---------- ADDRESS (LOCAL ONLY) ---------- */

  const handleAddAddress = async () => {
  try {
    const saved = await api.addAddress(newAddress);

    setAddresses(prev => [
      ...prev,
      {
        id: saved._id,
        street: saved.street,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        isDefault: saved.is_default,
      },
    ]);

    setNewAddress({ street: '', city: '', state: '', pincode: '' });
    setShowAddressForm(false);
    toast.success('Address added');
  } catch {
    toast.error('Failed to add address');
  }
};


  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses(addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      })));
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };
  /* ---------- HELPERS ---------- */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'created': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* HEADER */}
        <div className="bg-primary/10 rounded-2xl p-6 mb-8 flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profileData.name || 'Welcome'}</h1>
            <p className="text-muted-foreground">{profileData.email}</p>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="profile"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4" /> Addresses</TabsTrigger>
            <TabsTrigger value="orders"><Package className="w-4 h-4" /> Orders</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Name</Label>
                <Input value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                <Label>Email</Label>
                <Input value={profileData.email} disabled />
                <Label>Phone</Label>
                <Input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
                <Button onClick={handleProfileUpdate}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADDRESSES */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Addresses</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowAddressForm(!showAddressForm)}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">

                {showAddressForm && (
                  <div className="border p-4 rounded space-y-3">
                    <Input placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                    <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                    <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                    <Input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                    <Button onClick={handleAddAddress}>Save</Button>
                  </div>
                )}

                {addresses.map(addr => (
                  <div key={addr.id} className={`border p-4 rounded ${addr.isDefault ? 'border-primary' : ''}`}>
                    {addr.isDefault && <span className="text-xs bg-primary text-white px-2 py-1 rounded">Default</span>}
                    <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <div className="flex gap-2 mt-2">
                      {!addr.isDefault && <Button size="sm" variant="ghost" onClick={() => handleSetDefault(addr.id)}>Set Default</Button>}
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAddress(addr.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDERS */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
              <CardContent>
                {ordersLoading ? 'Loading...' : orders.map(o => (
                  <div key={o.id} className="border p-4 rounded mb-3 flex justify-between">
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-sm">{o.items} items</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(o.status)}`}>{o.status}</span>
                      <p className="font-semibold">₹{o.total}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <Button variant="destructive" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
