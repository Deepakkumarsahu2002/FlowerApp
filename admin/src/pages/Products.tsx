import { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { convertApiProductToAdmin, convertAdminProductToApi } from "@/lib/productUtils";
import { Product } from "@/types/admin";
import { toast as sonnerToast } from "sonner";

// Categories and occasions will be fetched from API

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]); // Store full API products for ID mapping
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [occasions, setOccasions] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    occasions: [] as string[],
    description: "",
    inStock: true,
  });

  const { toast } = useToast();

  // Fetch products, categories, and occasions from API
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedCategories, fetchedOccasions] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getOccasions(),
      ]);
      
      setApiProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setOccasions(fetchedOccasions);
      
      const convertedProducts = fetchedProducts.map(convertApiProductToAdmin);
      setProducts(convertedProducts);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      sonnerToast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to find category/occasion IDs by name
  const findCategoryId = (categoryName: string): string | undefined => {
    const category = categories.find(c => c.name === categoryName);
    return category?._id;
  };
  
  const findOccasionIds = (occasionNames: string[]): string[] => {
    return occasionNames
      .map(name => {
        const occasion = occasions.find(o => o.name === name);
        return occasion?._id;
      })
      .filter((id): id is string => !!id);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && product.inStock) ||
        (stockFilter === "outOfStock" && !product.inStock);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        category: product.category, // This is the category name
        occasions: product.occasions, // These are occasion names
        description: product.description,
        inStock: product.inStock,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        image: "",
        category: "",
        occasions: [],
        description: "",
        inStock: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFormOpen(false);
      
      // Find category and occasion IDs by name
      const categoryId = findCategoryId(formData.category);
      const occasionIds = findOccasionIds(formData.occasions);
      
      // Validate that we found the IDs
      if (!categoryId) {
        toast({
          title: "Validation Error",
          description: `Category "${formData.category}" not found. Please ensure categories are seeded in the database.`,
          variant: "destructive",
        });
        setIsFormOpen(true);
        return;
      }
      
      if (occasionIds.length !== formData.occasions.length) {
        const missingOccasions = formData.occasions.filter(
          name => !occasions.find(o => o.name === name)
        );
        toast({
          title: "Validation Error",
          description: `Some occasions not found: ${missingOccasions.join(', ')}. Please ensure occasions are seeded.`,
          variant: "destructive",
        });
        setIsFormOpen(true);
        return;
      }
      
      const apiData = convertAdminProductToApi(formData, categoryId, occasionIds);
    
    if (editingProduct) {
        // Update existing product
        const updatedApiProduct = await api.updateProduct(editingProduct.id, apiData);
        const updatedProduct = convertApiProductToAdmin(updatedApiProduct);
      setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      toast({
        title: "Product updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
        // Create new product
        const newApiProduct = await api.createProduct(apiData);
        const newProduct = convertApiProductToAdmin(newApiProduct);
      setProducts((prev) => [newProduct, ...prev]);
      toast({
        title: "Product created",
        description: `${formData.name} has been added successfully.`,
      });
    }
    } catch (error: any) {
      console.error("Error saving product:", error);
      sonnerToast.error(error.message || "Failed to save product");
      setIsFormOpen(true); // Reopen form on error
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    
    try {
      await api.deleteProduct(deleteProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      toast({
        title: "Product deleted",
        description: `${deleteProduct.name} has been removed.`,
      });
      setDeleteProduct(null);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      sonnerToast.error(error.message || "Failed to delete product");
      setDeleteProduct(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product) => <span className="font-medium">{formatCurrency(product.price)}</span>,
    },
    {
      key: "occasions",
      header: "Occasions",
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.occasions.slice(0, 2).map((occ) => (
            <span key={occ} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {occ}
            </span>
          ))}
          {product.occasions.length > 2 && (
            <span className="text-xs text-muted-foreground">+{product.occasions.length - 2}</span>
          )}
        </div>
      ),
      className: "hidden lg:table-cell",
    },
    {
      key: "stock",
      header: "Status",
      render: (product) => (
        <StatusBadge status={product.inStock ? "inStock" : "outOfStock"} />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenForm(product)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteProduct(product)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Products">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Manage Products</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search products..."
          filters={[
            {
              key: "category",
              label: "Category",
              options: [
                { value: "all", label: "All Categories" },
                ...categories.map((c) => ({ value: c.name, label: c.name })),
              ],
              value: categoryFilter,
              onChange: setCategoryFilter,
            },
            {
              key: "stock",
              label: "Stock",
              options: [
                { value: "inStock", label: "In Stock" },
                { value: "outOfStock", label: "Out of Stock" },
              ],
              value: stockFilter,
              onChange: setStockFilter,
            },
          ]}
          onClear={() => {
            setSearch("");
            setCategoryFilter("all");
            setStockFilter("all");
          }}
        />

        <DataTable
          data={filteredProducts}
          columns={columns}
          emptyMessage="No products found"
        />

        {/* Product Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Eternal Rose Bouquet"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Occasions</Label>
                <div className="flex flex-wrap gap-2">
                  {occasions.map((occ) => (
                    <Button
                      key={occ._id}
                      type="button"
                      variant={formData.occasions.includes(occ.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          occasions: prev.occasions.includes(occ.name)
                            ? prev.occasions.filter((o) => o !== occ.name)
                            : [...prev.occasions, occ.name],
                        }));
                      }}
                    >
                      {occ.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A stunning arrangement..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="inStock">In Stock</Label>
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteProduct}
          onOpenChange={() => setDeleteProduct(null)}
          title="Delete Product"
          description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteProduct}
        />
      </div>
    </AdminLayout>
  );
}
