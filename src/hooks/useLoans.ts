import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nextDocumentNumber } from "@/lib/documents";

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*, loan_products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLoanProducts() {
  return useQuery({
    queryKey: ["loan_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_products")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useLoanStats() {
  return useQuery({
    queryKey: ["loan_stats"],
    queryFn: async () => {
      const { data: loans, error } = await supabase
        .from("loans")
        .select("principal, outstanding_amount, status");
      
      if (error) throw error;

      const stats = {
        totalDisbursed: 0,
        outstanding: 0,
        collected: 0,
        activeLoans: 0,
        arrears: 0,
      };

      loans?.forEach((loan) => {
        if (loan.status === "active" || loan.status === "completed") {
          stats.totalDisbursed += Number(loan.principal) || 0;
        }
        if (loan.status === "active") {
          stats.activeLoans++;
          stats.outstanding += Number(loan.outstanding_amount) || 0;
        }
        if (loan.status === "defaulted") {
          stats.arrears += Number(loan.outstanding_amount) || 0;
        }
      });

      stats.collected = stats.totalDisbursed - stats.outstanding - stats.arrears;

      return stats;
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loan: {
      loan_product_id: string;
      borrower_name: string;
      borrower_phone?: string;
      borrower_email?: string;
      borrower_national_id?: string;
      borrower_address?: string;
      employer_name?: string;
      employer_phone?: string;
      monthly_income?: number;
      guarantor_name?: string;
      guarantor_phone?: string;
      guarantor_relation?: string;
      collateral_type?: string;
      collateral_description?: string;
      collateral_value?: number;
      principal: number;
      term_months: number;
    }) => {
      // Get loan product details
      const { data: product, error: productError } = await supabase
        .from("loan_products")
        .select("*")
        .eq("id", loan.loan_product_id)
        .single();

      if (productError) throw productError;

      // Calculate loan details
      const interest_rate = product.interest_rate;
      const total_interest = (loan.principal * interest_rate * loan.term_months) / 100;
      const total_amount = loan.principal + total_interest;
      const monthly_payment = total_amount / loan.term_months;
      const processing_fee = (loan.principal * product.processing_fee) / 100;

      // Generate loan number
      const loan_number = await nextDocumentNumber("LN");

      const { data, error } = await supabase.from("loans").insert({
        loan_product_id: loan.loan_product_id,
        borrower_name: loan.borrower_name,
        borrower_phone: loan.borrower_phone,
        borrower_email: loan.borrower_email,
        borrower_national_id: loan.borrower_national_id,
        borrower_address: loan.borrower_address,
        employer_name: loan.employer_name,
        employer_phone: loan.employer_phone,
        monthly_income: loan.monthly_income,
        guarantor_name: loan.guarantor_name,
        guarantor_phone: loan.guarantor_phone,
        guarantor_relation: loan.guarantor_relation,
        collateral_type: loan.collateral_type,
        collateral_description: loan.collateral_description,
        collateral_value: loan.collateral_value,
        principal: loan.principal,
        term_months: loan.term_months,
        loan_number,
        interest_rate,
        total_interest,
        total_amount,
        monthly_payment,
        processing_fee,
        outstanding_principal: loan.principal,
        outstanding_amount: total_amount,
        status: "pending",
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan_stats"] });
      toast.success("Loan application created");
    },
    onError: (error) => {
      toast.error("Failed to create loan: " + error.message);
    },
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("loans")
        .update({
          status: "active",
          approval_date: new Date().toISOString().slice(0, 10),
          disbursement_date: new Date().toISOString().slice(0, 10),
        })
        .eq("id", id);
      if (error) throw error;
      const { error: schedErr } = await supabase.rpc("generate_loan_schedule", { p_loan_id: id });
      if (schedErr) throw schedErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan_stats"] });
      toast.success("Loan approved and schedule generated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
