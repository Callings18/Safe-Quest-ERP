import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Warehouse,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  Boxes,
} from "lucide-react";

const inventoryStats = {
  totalItems: 248,
  totalValue: 1850000,
  lowStock: 12,
  outOfStock: 3,
};

const warehouses = [
  { id: 1, name: "Lusaka Main", items: 156, value: 1200000 },
  { id: 2, name: "Ndola Branch", items: 62, value: 450000 },
  { id: 3, name: "Kitwe Store", items: 30, value: 200000 },
];

const products = [
  {
    id: 1,
    sku: "SOL-PAN-320",
    name: "Solar Panel 320W Mono",
    category: "Solar Equipment",
    warehouse: "Lusaka Main",
    quantity: 45,
    reorderLevel: 20,
    unitCost: 2500,
    totalValue: 112500,
    status: "in-stock",
  },
  {
    id: 2,
    sku: "INV-5KW-HYB",
    name: "Hybrid Inverter 5kW",
    category: "Solar Equipment",
    warehouse: "Lusaka Main",
    quantity: 8,
    reorderLevel: 10,
    unitCost: 15000,
    totalValue: 120000,
    status: "low-stock",
  },
  {
    id: 3,
    sku: "BAT-LI-200",
    name: "Lithium Battery 200Ah",
    category: "Solar Equipment",
    warehouse: "Lusaka Main",
    quantity: 0,
    reorderLevel: 5,
    unitCost: 25000,
    totalValue: 0,
    status: "out-of-stock",
  },
  {
    id: 4,
    sku: "CEM-POR-50",
    name: "Portland Cement 50kg",
    category: "Construction",
    warehouse: "Lusaka Main",
    quantity: 320,
    reorderLevel: 100,
    unitCost: 145,
    totalValue: 46400,
    status: "in-stock",
  },
  {
    id: 5,
    sku: "STL-ROD-12",
    name: "Steel Rod 12mm",
    category: "Construction",
    warehouse: "Ndola Branch",
    quantity: 85,
    reorderLevel: 50,
    unitCost: 280,
    totalValue: 23800,
    status: "in-stock",
  },
  {
    id: 6,
    sku: "CAB-SOL-6MM",
    name: "Solar Cable 6mm (100m)",
    category: "Electrical",
    warehouse: "Lusaka Main",
    quantity: 12,
    reorderLevel: 15,
    unitCost: 1800,
    totalValue: 21600,
    status: "low-stock",
  },
];

const recentMovements = [
  { id: 1, type: "in", product: "Solar Panel 320W", qty: 20, date: "2024-12-01", ref: "GRN-2024-089" },
  { id: 2, type: "out", product: "Portland Cement 50kg", qty: 50, date: "2024-12-01", ref: "PRJ-KAF-002" },
  { id: 3, type: "out", product: "Hybrid Inverter 5kW", qty: 2, date: "2024-11-30", ref: "SAL-2024-156" },
  { id: 4, type: "in", product: "Steel Rod 12mm", qty: 100, date: "2024-11-29", ref: "GRN-2024-088" },
];

const statusConfig = {
  "in-stock": { color: "bg-success/10 text-success border-success/20", label: "In Stock" },
  "low-stock": { color: "bg-warning/10 text-warning border-warning/20", label: "Low Stock" },
  "out-of-stock": { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Out of Stock" },
};

export default function Inventory() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory & Stock</h1>
            <p className="text-muted-foreground">
              Multi-warehouse inventory management with real-time tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              Goods In
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">K{(inventoryStats.totalValue / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-warning">{inventoryStats.lowStock}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingDown className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-destructive">{inventoryStats.outOfStock}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warehouses */}
        <div className="grid gap-4 md:grid-cols-3">
          {warehouses.map((warehouse, index) => (
            <Card key={warehouse.id} className="hover:border-primary/30 transition-colors cursor-pointer animate-slide-up" style={{ animationDelay: `${200 + index * 50}ms` }}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Warehouse className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <p className="text-xs text-muted-foreground">{warehouse.items} items</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="font-semibold text-primary">K{warehouse.value.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="products">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Warehouse</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Qty</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Reorder</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Unit Cost</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Total Value</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="p-4 text-sm">{product.warehouse}</td>
                          <td className="p-4 text-right">
                            <span className={product.quantity <= product.reorderLevel ? "font-semibold text-warning" : "font-medium"}>
                              {product.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-right text-muted-foreground">{product.reorderLevel}</td>
                          <td className="p-4 text-right">K{product.unitCost.toLocaleString()}</td>
                          <td className="p-4 text-right font-semibold">K{product.totalValue.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={statusConfig[product.status as keyof typeof statusConfig].color}>
                              {statusConfig[product.status as keyof typeof statusConfig].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem>Stock In</DropdownMenuItem>
                                <DropdownMenuItem>Stock Out</DropdownMenuItem>
                                <DropdownMenuItem>Create PO</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-lg ${movement.type === "in" ? "bg-success/10" : "bg-primary/10"}`}>
                      {movement.type === "in" ? (
                        <ArrowDown className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{movement.product}</p>
                      <p className="text-sm text-muted-foreground">Ref: {movement.ref}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${movement.type === "in" ? "text-success" : "text-primary"}`}>
                        {movement.type === "in" ? "+" : "-"}{movement.qty}
                      </p>
                      <p className="text-xs text-muted-foreground">{movement.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Boxes className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Solar Equipment</h3>
                    <p className="text-2xl font-bold">86</p>
                    <p className="text-sm text-muted-foreground">items • K1.2M value</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Boxes className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="font-semibold">Construction</h3>
                    <p className="text-2xl font-bold">124</p>
                    <p className="text-sm text-muted-foreground">items • K450K value</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                      <Boxes className="h-6 w-6 text-info" />
                    </div>
                    <h3 className="font-semibold">Electrical</h3>
                    <p className="text-2xl font-bold">38</p>
                    <p className="text-sm text-muted-foreground">items • K200K value</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
