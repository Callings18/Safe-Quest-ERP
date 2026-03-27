import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAssets, useVehicles, useMaintenanceRecords, useFuelLogs,
  useCreateAsset, useCreateVehicle, useCreateMaintenanceRecord, useCreateFuelLog, useAssetStats
} from "@/hooks/useAssets";
import {
  Loader2, Plus, Search, Truck, Wrench, Fuel, Package, AlertTriangle,
  Calendar, DollarSign, Activity
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800", inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800", disposed: "bg-red-100 text-red-800",
  sold: "bg-blue-100 text-blue-800", accident: "bg-red-100 text-red-800",
  scheduled: "bg-blue-100 text-blue-800", in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function Assets() {
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: maintenance, isLoading: maintenanceLoading } = useMaintenanceRecords();
  const { data: fuelLogs, isLoading: fuelLoading } = useFuelLogs();
  const { data: stats } = useAssetStats();
  const createAsset = useCreateAsset();
  const createVehicle = useCreateVehicle();
  const createMaintenance = useCreateMaintenanceRecord();
  const createFuelLog = useCreateFuelLog();

  const [assetDialog, setAssetDialog] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [fuelDialog, setFuelDialog] = useState(false);
  const [search, setSearch] = useState("");

  const [assetForm, setAssetForm] = useState({ asset_number: "", name: "", category: "equipment", description: "", serial_number: "", purchase_date: "", purchase_price: "", current_value: "", location: "", assigned_to: "", warranty_expiry: "", notes: "" });
  const [vehicleForm, setVehicleForm] = useState({ registration_number: "", make: "", model: "", year: "", color: "", vin: "", fuel_type: "diesel", tank_capacity: "", current_mileage: "", purchase_date: "", purchase_price: "", insurance_expiry: "", fitness_expiry: "", assigned_driver: "", notes: "" });
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicle_id: "", asset_id: "", maintenance_type: "preventive", description: "", scheduled_date: "", cost: "", vendor: "", mileage_at_service: "", next_service_date: "", notes: "" });
  const [fuelForm, setFuelForm] = useState({ vehicle_id: "", fill_date: new Date().toISOString().split("T")[0], fuel_type: "diesel", quantity: "", unit_price: "", mileage_at_fill: "", station: "", driver: "", receipt_number: "", notes: "" });

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAsset.mutateAsync({
      ...assetForm,
      purchase_price: Number(assetForm.purchase_price) || 0,
      current_value: Number(assetForm.current_value) || 0,
      purchase_date: assetForm.purchase_date || undefined,
      warranty_expiry: assetForm.warranty_expiry || undefined,
    });
    setAssetDialog(false);
    setAssetForm({ asset_number: "", name: "", category: "equipment", description: "", serial_number: "", purchase_date: "", purchase_price: "", current_value: "", location: "", assigned_to: "", warranty_expiry: "", notes: "" });
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVehicle.mutateAsync({
      ...vehicleForm,
      year: Number(vehicleForm.year) || undefined,
      tank_capacity: Number(vehicleForm.tank_capacity) || undefined,
      current_mileage: Number(vehicleForm.current_mileage) || 0,
      purchase_price: Number(vehicleForm.purchase_price) || 0,
      purchase_date: vehicleForm.purchase_date || undefined,
      insurance_expiry: vehicleForm.insurance_expiry || undefined,
      fitness_expiry: vehicleForm.fitness_expiry || undefined,
    });
    setVehicleDialog(false);
    setVehicleForm({ registration_number: "", make: "", model: "", year: "", color: "", vin: "", fuel_type: "diesel", tank_capacity: "", current_mileage: "", purchase_date: "", purchase_price: "", insurance_expiry: "", fitness_expiry: "", assigned_driver: "", notes: "" });
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaintenance.mutateAsync({
      vehicle_id: maintenanceForm.vehicle_id || undefined,
      asset_id: maintenanceForm.asset_id || undefined,
      maintenance_type: maintenanceForm.maintenance_type,
      description: maintenanceForm.description,
      scheduled_date: maintenanceForm.scheduled_date || undefined,
      cost: Number(maintenanceForm.cost) || 0,
      vendor: maintenanceForm.vendor || undefined,
      mileage_at_service: Number(maintenanceForm.mileage_at_service) || undefined,
      next_service_date: maintenanceForm.next_service_date || undefined,
      notes: maintenanceForm.notes || undefined,
    });
    setMaintenanceDialog(false);
    setMaintenanceForm({ vehicle_id: "", asset_id: "", maintenance_type: "preventive", description: "", scheduled_date: "", cost: "", vendor: "", mileage_at_service: "", next_service_date: "", notes: "" });
  };

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(fuelForm.quantity);
    const price = Number(fuelForm.unit_price);
    await createFuelLog.mutateAsync({
      vehicle_id: fuelForm.vehicle_id,
      fill_date: fuelForm.fill_date,
      fuel_type: fuelForm.fuel_type,
      quantity: qty,
      unit_price: price,
      total_cost: qty * price,
      mileage_at_fill: Number(fuelForm.mileage_at_fill) || undefined,
      station: fuelForm.station || undefined,
      driver: fuelForm.driver || undefined,
      receipt_number: fuelForm.receipt_number || undefined,
      notes: fuelForm.notes || undefined,
    });
    setFuelDialog(false);
    setFuelForm({ vehicle_id: "", fill_date: new Date().toISOString().split("T")[0], fuel_type: "diesel", quantity: "", unit_price: "", mileage_at_fill: "", station: "", driver: "", receipt_number: "", notes: "" });
  };

  const fmt = (n?: number | null) => n != null ? `K ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assets & Fleet</h1>
            <p className="text-muted-foreground">Manage equipment, vehicles, maintenance & fuel</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total Assets</p><p className="text-2xl font-bold">{stats?.totalAssets || 0}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Truck className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Active Vehicles</p><p className="text-2xl font-bold">{stats?.activeVehicles || 0} / {stats?.totalVehicles || 0}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Asset Value</p><p className="text-2xl font-bold">{fmt(stats?.totalAssetValue)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-destructive" /><div><p className="text-sm text-muted-foreground">Overdue Maintenance</p><p className="text-2xl font-bold">{stats?.overdueMaintenance || 0}</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="assets">
          <TabsList>
            <TabsTrigger value="assets"><Package className="h-4 w-4 mr-1" />Assets</TabsTrigger>
            <TabsTrigger value="vehicles"><Truck className="h-4 w-4 mr-1" />Vehicles</TabsTrigger>
            <TabsTrigger value="maintenance"><Wrench className="h-4 w-4 mr-1" />Maintenance</TabsTrigger>
            <TabsTrigger value="fuel"><Fuel className="h-4 w-4 mr-1" />Fuel Logs</TabsTrigger>
          </TabsList>

          {/* ASSETS TAB */}
          <TabsContent value="assets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Equipment & Assets</CardTitle>
                <div className="flex gap-2">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9 w-64" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Button onClick={() => setAssetDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Asset</Button>
                </div>
              </CardHeader>
              <CardContent>
                {assetsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Asset #</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
                      <TableHead>Location</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {assets?.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.asset_number.toLowerCase().includes(search.toLowerCase())).map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.asset_number}</TableCell>
                          <TableCell>{a.name}</TableCell>
                          <TableCell className="capitalize">{a.category}</TableCell>
                          <TableCell>{a.location || "—"}</TableCell>
                          <TableCell>{fmt(a.current_value)}</TableCell>
                          <TableCell><Badge className={statusColors[a.status || "active"]}>{a.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {(!assets || assets.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No assets yet</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* VEHICLES TAB */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fleet Vehicles</CardTitle>
                <Button onClick={() => setVehicleDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Vehicle</Button>
              </CardHeader>
              <CardContent>
                {vehiclesLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Reg #</TableHead><TableHead>Vehicle</TableHead><TableHead>Fuel</TableHead>
                      <TableHead>Mileage</TableHead><TableHead>Driver</TableHead><TableHead>Insurance</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {vehicles?.map(v => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.registration_number}</TableCell>
                          <TableCell>{v.make} {v.model} {v.year ? `(${v.year})` : ""}</TableCell>
                          <TableCell className="capitalize">{v.fuel_type}</TableCell>
                          <TableCell>{v.current_mileage?.toLocaleString() || "0"} km</TableCell>
                          <TableCell>{v.assigned_driver || "—"}</TableCell>
                          <TableCell>{v.insurance_expiry ? format(new Date(v.insurance_expiry), "dd MMM yyyy") : "—"}</TableCell>
                          <TableCell><Badge className={statusColors[v.status || "active"]}>{v.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {(!vehicles || vehicles.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No vehicles yet</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MAINTENANCE TAB */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maintenance Schedule</CardTitle>
                <Button onClick={() => setMaintenanceDialog(true)}><Plus className="h-4 w-4 mr-1" />Schedule Maintenance</Button>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Asset/Vehicle</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                      <TableHead>Date</TableHead><TableHead>Cost</TableHead><TableHead>Vendor</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {maintenance?.map(m => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {m.vehicles ? `${(m.vehicles as any).registration_number} - ${(m.vehicles as any).make}` : m.assets ? `${(m.assets as any).asset_number} - ${(m.assets as any).name}` : "—"}
                          </TableCell>
                          <TableCell className="capitalize">{m.maintenance_type}</TableCell>
                          <TableCell className="max-w-48 truncate">{m.description}</TableCell>
                          <TableCell>{m.scheduled_date ? format(new Date(m.scheduled_date), "dd MMM yyyy") : "—"}</TableCell>
                          <TableCell>{fmt(m.cost)}</TableCell>
                          <TableCell>{m.vendor || "—"}</TableCell>
                          <TableCell><Badge className={statusColors[m.status || "scheduled"]}>{m.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {(!maintenance || maintenance.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No maintenance records</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FUEL LOGS TAB */}
          <TabsContent value="fuel">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fuel Consumption</CardTitle>
                <Button onClick={() => setFuelDialog(true)}><Plus className="h-4 w-4 mr-1" />Log Fuel</Button>
              </CardHeader>
              <CardContent>
                {fuelLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Vehicle</TableHead><TableHead>Date</TableHead><TableHead>Fuel</TableHead>
                      <TableHead>Qty (L)</TableHead><TableHead>Cost</TableHead><TableHead>Mileage</TableHead>
                      <TableHead>Station</TableHead><TableHead>Driver</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {fuelLogs?.map(f => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{f.vehicles ? `${(f.vehicles as any).registration_number}` : "—"}</TableCell>
                          <TableCell>{format(new Date(f.fill_date), "dd MMM yyyy")}</TableCell>
                          <TableCell className="capitalize">{f.fuel_type}</TableCell>
                          <TableCell>{Number(f.quantity).toFixed(1)}</TableCell>
                          <TableCell>{fmt(f.total_cost)}</TableCell>
                          <TableCell>{f.mileage_at_fill ? `${Number(f.mileage_at_fill).toLocaleString()} km` : "—"}</TableCell>
                          <TableCell>{f.station || "—"}</TableCell>
                          <TableCell>{f.driver || "—"}</TableCell>
                        </TableRow>
                      ))}
                      {(!fuelLogs || fuelLogs.length === 0) && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No fuel logs yet</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ADD ASSET DIALOG */}
      <Dialog open={assetDialog} onOpenChange={setAssetDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAsset} className="grid grid-cols-2 gap-4">
            <div><Label>Asset Number *</Label><Input required value={assetForm.asset_number} onChange={e => setAssetForm(p => ({ ...p, asset_number: e.target.value }))} placeholder="AST-001" /></div>
            <div><Label>Name *</Label><Input required value={assetForm.name} onChange={e => setAssetForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Category</Label>
              <Select value={assetForm.category} onValueChange={v => setAssetForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="solar_panels">Solar Panels</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Serial Number</Label><Input value={assetForm.serial_number} onChange={e => setAssetForm(p => ({ ...p, serial_number: e.target.value }))} /></div>
            <div><Label>Purchase Date</Label><Input type="date" value={assetForm.purchase_date} onChange={e => setAssetForm(p => ({ ...p, purchase_date: e.target.value }))} /></div>
            <div><Label>Purchase Price</Label><Input type="number" step="0.01" value={assetForm.purchase_price} onChange={e => setAssetForm(p => ({ ...p, purchase_price: e.target.value }))} /></div>
            <div><Label>Current Value</Label><Input type="number" step="0.01" value={assetForm.current_value} onChange={e => setAssetForm(p => ({ ...p, current_value: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={assetForm.location} onChange={e => setAssetForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div><Label>Assigned To</Label><Input value={assetForm.assigned_to} onChange={e => setAssetForm(p => ({ ...p, assigned_to: e.target.value }))} /></div>
            <div><Label>Warranty Expiry</Label><Input type="date" value={assetForm.warranty_expiry} onChange={e => setAssetForm(p => ({ ...p, warranty_expiry: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={assetForm.notes} onChange={e => setAssetForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAssetDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createAsset.isPending}>{createAsset.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Asset</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD VEHICLE DIALOG */}
      <Dialog open={vehicleDialog} onOpenChange={setVehicleDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateVehicle} className="grid grid-cols-2 gap-4">
            <div><Label>Registration # *</Label><Input required value={vehicleForm.registration_number} onChange={e => setVehicleForm(p => ({ ...p, registration_number: e.target.value }))} placeholder="ABZ 1234" /></div>
            <div><Label>Make *</Label><Input required value={vehicleForm.make} onChange={e => setVehicleForm(p => ({ ...p, make: e.target.value }))} placeholder="Toyota" /></div>
            <div><Label>Model *</Label><Input required value={vehicleForm.model} onChange={e => setVehicleForm(p => ({ ...p, model: e.target.value }))} placeholder="Hilux" /></div>
            <div><Label>Year</Label><Input type="number" value={vehicleForm.year} onChange={e => setVehicleForm(p => ({ ...p, year: e.target.value }))} /></div>
            <div><Label>Color</Label><Input value={vehicleForm.color} onChange={e => setVehicleForm(p => ({ ...p, color: e.target.value }))} /></div>
            <div><Label>Fuel Type</Label>
              <Select value={vehicleForm.fuel_type} onValueChange={v => setVehicleForm(p => ({ ...p, fuel_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tank Capacity (L)</Label><Input type="number" value={vehicleForm.tank_capacity} onChange={e => setVehicleForm(p => ({ ...p, tank_capacity: e.target.value }))} /></div>
            <div><Label>Current Mileage (km)</Label><Input type="number" value={vehicleForm.current_mileage} onChange={e => setVehicleForm(p => ({ ...p, current_mileage: e.target.value }))} /></div>
            <div><Label>Purchase Date</Label><Input type="date" value={vehicleForm.purchase_date} onChange={e => setVehicleForm(p => ({ ...p, purchase_date: e.target.value }))} /></div>
            <div><Label>Purchase Price</Label><Input type="number" step="0.01" value={vehicleForm.purchase_price} onChange={e => setVehicleForm(p => ({ ...p, purchase_price: e.target.value }))} /></div>
            <div><Label>Insurance Expiry</Label><Input type="date" value={vehicleForm.insurance_expiry} onChange={e => setVehicleForm(p => ({ ...p, insurance_expiry: e.target.value }))} /></div>
            <div><Label>Fitness Expiry</Label><Input type="date" value={vehicleForm.fitness_expiry} onChange={e => setVehicleForm(p => ({ ...p, fitness_expiry: e.target.value }))} /></div>
            <div><Label>Assigned Driver</Label><Input value={vehicleForm.assigned_driver} onChange={e => setVehicleForm(p => ({ ...p, assigned_driver: e.target.value }))} /></div>
            <div><Label>VIN</Label><Input value={vehicleForm.vin} onChange={e => setVehicleForm(p => ({ ...p, vin: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={vehicleForm.notes} onChange={e => setVehicleForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setVehicleDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createVehicle.isPending}>{createVehicle.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MAINTENANCE DIALOG */}
      <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Maintenance</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateMaintenance} className="grid grid-cols-2 gap-4">
            <div><Label>Vehicle</Label>
              <Select value={maintenanceForm.vehicle_id} onValueChange={v => setMaintenanceForm(p => ({ ...p, vehicle_id: v, asset_id: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>{vehicles?.map(v => <SelectItem key={v.id} value={v.id}>{v.registration_number} - {v.make} {v.model}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Or Asset</Label>
              <Select value={maintenanceForm.asset_id} onValueChange={v => setMaintenanceForm(p => ({ ...p, asset_id: v, vehicle_id: "" }))}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>{assets?.map(a => <SelectItem key={a.id} value={a.id}>{a.asset_number} - {a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Type</Label>
              <Select value={maintenanceForm.maintenance_type} onValueChange={v => setMaintenanceForm(p => ({ ...p, maintenance_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Scheduled Date</Label><Input type="date" value={maintenanceForm.scheduled_date} onChange={e => setMaintenanceForm(p => ({ ...p, scheduled_date: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Description *</Label><Textarea required value={maintenanceForm.description} onChange={e => setMaintenanceForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Est. Cost</Label><Input type="number" step="0.01" value={maintenanceForm.cost} onChange={e => setMaintenanceForm(p => ({ ...p, cost: e.target.value }))} /></div>
            <div><Label>Vendor</Label><Input value={maintenanceForm.vendor} onChange={e => setMaintenanceForm(p => ({ ...p, vendor: e.target.value }))} /></div>
            <div><Label>Mileage at Service</Label><Input type="number" value={maintenanceForm.mileage_at_service} onChange={e => setMaintenanceForm(p => ({ ...p, mileage_at_service: e.target.value }))} /></div>
            <div><Label>Next Service Date</Label><Input type="date" value={maintenanceForm.next_service_date} onChange={e => setMaintenanceForm(p => ({ ...p, next_service_date: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={maintenanceForm.notes} onChange={e => setMaintenanceForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createMaintenance.isPending}>{createMaintenance.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FUEL LOG DIALOG */}
      <Dialog open={fuelDialog} onOpenChange={setFuelDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log Fuel Purchase</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateFuelLog} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Vehicle *</Label>
              <Select value={fuelForm.vehicle_id} onValueChange={v => setFuelForm(p => ({ ...p, vehicle_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>{vehicles?.map(v => <SelectItem key={v.id} value={v.id}>{v.registration_number} - {v.make} {v.model}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Fill Date</Label><Input type="date" value={fuelForm.fill_date} onChange={e => setFuelForm(p => ({ ...p, fill_date: e.target.value }))} /></div>
            <div><Label>Fuel Type</Label>
              <Select value={fuelForm.fuel_type} onValueChange={v => setFuelForm(p => ({ ...p, fuel_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity (L) *</Label><Input required type="number" step="0.1" value={fuelForm.quantity} onChange={e => setFuelForm(p => ({ ...p, quantity: e.target.value }))} /></div>
            <div><Label>Unit Price (K) *</Label><Input required type="number" step="0.01" value={fuelForm.unit_price} onChange={e => setFuelForm(p => ({ ...p, unit_price: e.target.value }))} /></div>
            <div><Label>Total</Label><Input readOnly value={fuelForm.quantity && fuelForm.unit_price ? `K ${(Number(fuelForm.quantity) * Number(fuelForm.unit_price)).toFixed(2)}` : ""} /></div>
            <div><Label>Mileage (km)</Label><Input type="number" value={fuelForm.mileage_at_fill} onChange={e => setFuelForm(p => ({ ...p, mileage_at_fill: e.target.value }))} /></div>
            <div><Label>Station</Label><Input value={fuelForm.station} onChange={e => setFuelForm(p => ({ ...p, station: e.target.value }))} /></div>
            <div><Label>Driver</Label><Input value={fuelForm.driver} onChange={e => setFuelForm(p => ({ ...p, driver: e.target.value }))} /></div>
            <div><Label>Receipt #</Label><Input value={fuelForm.receipt_number} onChange={e => setFuelForm(p => ({ ...p, receipt_number: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={fuelForm.notes} onChange={e => setFuelForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFuelDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createFuelLog.isPending || !fuelForm.vehicle_id}>{createFuelLog.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
