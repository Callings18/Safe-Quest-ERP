import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts, useWarehouses, useProductCategories, useInventoryStats, useCreateProduct } from "@/hooks/useInventory";
import { Loader2, Plus, Search, Package, AlertTriangle, Warehouse, TrendingDown, TrendingUp, Boxes } from "lucide-react";

export default function Inventory() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses();
  const { data: categories } = useProductCategories();
  const { data: stats } = useInventoryStats();
  const createProduct = useCreateProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", description: "", category_id: "", unit: "pcs", cost_price: "", selling_price: "", reorder_level: "10" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct.mutateAsync({
      ...form,
      cost_price: Number(form.cost_price) || undefined,
      selling_price: Number(form.selling_price) || undefined,
      reorder_level: Number(form.reorder_level) || 10,
    });
    setDialogOpen(false);
    setForm({ name: "", sku: "", description: "", category_id: "", unit: "pcs", cost_price: "", selling_price: "", reorder_level: "10" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory & Stock</h1>
            <p className="text-muted-foreground">Multi-warehouse inventory management with real-time tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Product</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>Product Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>SKU (optional)</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated if empty" /></div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Cost Price (K)</Label><Input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Sell Price (K)</Label><Input type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={createProduct.isPending}>
                    {createProduct.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Product
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Products</p><p className="text-2xl font-bold">{products?.length || 0}</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold">K{((stats?.totalValue || 0) / 1000).toFixed(0)}K</p></div>
                <div className="p-3 rounded-xl bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-warning">{stats?.lowStockCount || 0}</p></div>
                <div className="p-3 rounded-xl bg-warning/10"><TrendingDown className="h-5 w-5 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Warehouses</p><p className="text-2xl font-bold">{warehouses?.length || 0}</p></div>
                <div className="p-3 rounded-xl bg-info/10"><Warehouse className="h-5 w-5 text-info" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {warehousesLoading ? (
            <div className="col-span-3 flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : warehouses?.length === 0 ? (
            <Card className="col-span-3"><CardContent className="py-8 text-center text-muted-foreground">No warehouses configured.</CardContent></Card>
          ) : (
            warehouses?.map((warehouse, index) => (
              <Card key={warehouse.id} className="hover:border-primary/30 transition-colors cursor-pointer animate-slide-up" style={{ animationDelay: `${200 + index * 50}ms` }}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10"><Warehouse className="h-5 w-5 text-primary" /></div>
                    <div><h3 className="font-semibold">{warehouse.name}</h3><p className="text-xs text-muted-foreground">{warehouse.city || "No location"}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9 w-64" />
            </div>
          </div>

          <TabsContent value="products">
            <Card>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !products?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No products yet. Add your first product.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Cost</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Sell</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Reorder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.sku}</p></div>
                            </td>
                            <td className="p-4"><Badge variant="outline">{product.product_categories?.name || "-"}</Badge></td>
                            <td className="p-4 text-right">K{Number(product.cost_price || 0).toLocaleString()}</td>
                            <td className="p-4 text-right">K{Number(product.selling_price || 0).toLocaleString()}</td>
                            <td className="p-4 text-right text-muted-foreground">{product.reorder_level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-4 md:grid-cols-3">
              {categories?.map((category) => (
                <Card key={category.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Boxes className="h-6 w-6 text-primary" /></div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description || "No description"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
