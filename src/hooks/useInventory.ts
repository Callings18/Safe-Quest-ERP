import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*, products(*), warehouses(*)");
      if (error) throw error;
      return data;
    },
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory_stats"],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, cost_price, reorder_level")
        .eq("is_active", true);

      const { data: inventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("product_id, quantity, reserved_quantity");

      if (productsError || inventoryError) throw productsError || inventoryError;

      let totalValue = 0;
      let totalItems = 0;
      let lowStockCount = 0;

      const productMap = new Map(products?.map((p) => [p.id, p]));

      inventory?.forEach((inv) => {
        const product = productMap.get(inv.product_id);
        if (product) {
          const qty = inv.quantity || 0;
          totalItems += qty;
          totalValue += qty * (Number(product.cost_price) || 0);
          
          if (qty <= (product.reorder_level || 10)) {
            lowStockCount++;
          }
        }
      });

      return {
        totalValue,
        totalItems,
        lowStockCount,
        categoryCount: new Set(products?.map((p) => p.id)).size,
      };
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      name: string;
      sku?: string;
      description?: string;
      category_id?: string;
      unit?: string;
      cost_price?: number;
      selling_price?: number;
      reorder_level?: number;
    }) => {
      const sku = product.sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, sku })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
    },
    onError: (error) => {
      toast.error("Failed to create product: " + error.message);
    },
  });
}
