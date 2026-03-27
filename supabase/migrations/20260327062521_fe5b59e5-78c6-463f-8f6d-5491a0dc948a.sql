
-- Asset types enum
CREATE TYPE public.asset_status AS ENUM ('active', 'inactive', 'maintenance', 'disposed', 'sold');
CREATE TYPE public.vehicle_status AS ENUM ('active', 'inactive', 'maintenance', 'accident', 'disposed');
CREATE TYPE public.maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled');

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_number TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'equipment',
  description TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  depreciation_rate NUMERIC DEFAULT 0,
  location TEXT,
  assigned_to TEXT,
  branch_id UUID REFERENCES public.branches(id),
  status asset_status DEFAULT 'active',
  warranty_expiry DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  vin TEXT,
  engine_number TEXT,
  fuel_type TEXT DEFAULT 'diesel',
  tank_capacity NUMERIC,
  current_mileage NUMERIC DEFAULT 0,
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  insurance_expiry DATE,
  fitness_expiry DATE,
  assigned_driver TEXT,
  branch_id UUID REFERENCES public.branches(id),
  status vehicle_status DEFAULT 'active',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance records
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL DEFAULT 'preventive',
  description TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  cost NUMERIC DEFAULT 0,
  vendor TEXT,
  mileage_at_service NUMERIC,
  next_service_date DATE,
  next_service_mileage NUMERIC,
  status maintenance_status DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_asset_or_vehicle CHECK (asset_id IS NOT NULL OR vehicle_id IS NOT NULL)
);

-- Fuel logs
CREATE TABLE public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  fill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fuel_type TEXT DEFAULT 'diesel',
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  mileage_at_fill NUMERIC,
  station TEXT,
  driver TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view assets" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees can manage assets" ON public.assets FOR ALL TO authenticated USING (is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees can manage vehicles" ON public.vehicles FOR ALL TO authenticated USING (is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view maintenance" ON public.maintenance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees can manage maintenance" ON public.maintenance_records FOR ALL TO authenticated USING (is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view fuel logs" ON public.fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees can manage fuel logs" ON public.fuel_logs FOR ALL TO authenticated USING (is_employee(auth.uid()));
