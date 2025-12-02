export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          branch_id: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          name: string
          project_id: string | null
          reminder_days: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          name: string
          project_id?: string | null
          reminder_days?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          name?: string
          project_id?: string | null
          reminder_days?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          job_title: string | null
          last_name: string | null
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          basic_salary: number | null
          branch_id: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          is_active: boolean | null
          job_title: string | null
          last_name: string
          napsa_number: string | null
          national_id: string | null
          nhima_number: string | null
          phone: string | null
          tax_pin: string | null
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name: string
          napsa_number?: string | null
          national_id?: string | null
          nhima_number?: string | null
          phone?: string | null
          tax_pin?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string
          napsa_number?: string | null
          national_id?: string | null
          nhima_number?: string | null
          phone?: string | null
          tax_pin?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          quantity: number | null
          reserved_quantity: number | null
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number | null
          tax_rate: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number | null
          tax_rate?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          branch_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          notes: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          probability: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          probability?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          probability?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          interest_rate: number
          interest_type: string | null
          is_active: boolean | null
          late_fee: number | null
          max_amount: number
          max_term: number
          min_amount: number
          min_term: number
          name: string
          processing_fee: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          interest_rate: number
          interest_type?: string | null
          is_active?: boolean | null
          late_fee?: number | null
          max_amount: number
          max_term: number
          min_amount: number
          min_term: number
          name: string
          processing_fee?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          interest_rate?: number
          interest_type?: string | null
          is_active?: boolean | null
          late_fee?: number | null
          max_amount?: number
          max_term?: number
          min_amount?: number
          min_term?: number
          name?: string
          processing_fee?: number | null
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          received_by: string | null
          reference: string | null
          schedule_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
          reference?: string | null
          schedule_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
          reference?: string | null
          schedule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_repayments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "loan_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_schedule: {
        Row: {
          created_at: string
          due_date: string
          id: string
          installment_number: number
          interest_due: number
          interest_paid: number | null
          is_paid: boolean | null
          loan_id: string
          paid_date: string | null
          principal_due: number
          principal_paid: number | null
          total_due: number
          total_paid: number | null
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          interest_due: number
          interest_paid?: number | null
          is_paid?: boolean | null
          loan_id: string
          paid_date?: string | null
          principal_due: number
          principal_paid?: number | null
          total_due: number
          total_paid?: number | null
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          interest_due?: number
          interest_paid?: number | null
          is_paid?: boolean | null
          loan_id?: string
          paid_date?: string | null
          principal_due?: number
          principal_paid?: number | null
          total_due?: number
          total_paid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_schedule_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          application_date: string | null
          approval_date: string | null
          approved_by: string | null
          borrower_address: string | null
          borrower_email: string | null
          borrower_name: string
          borrower_national_id: string | null
          borrower_phone: string | null
          branch_id: string | null
          collateral_description: string | null
          collateral_type: string | null
          collateral_value: number | null
          created_at: string
          disbursement_date: string | null
          employer_name: string | null
          employer_phone: string | null
          guarantor_name: string | null
          guarantor_phone: string | null
          guarantor_relation: string | null
          id: string
          interest_rate: number
          loan_number: string
          loan_officer_id: string | null
          loan_product_id: string
          maturity_date: string | null
          monthly_income: number | null
          monthly_payment: number
          outstanding_amount: number | null
          outstanding_principal: number | null
          principal: number
          processing_fee: number | null
          status: Database["public"]["Enums"]["loan_status"] | null
          term_months: number
          total_amount: number
          total_interest: number | null
          updated_at: string
        }
        Insert: {
          application_date?: string | null
          approval_date?: string | null
          approved_by?: string | null
          borrower_address?: string | null
          borrower_email?: string | null
          borrower_name: string
          borrower_national_id?: string | null
          borrower_phone?: string | null
          branch_id?: string | null
          collateral_description?: string | null
          collateral_type?: string | null
          collateral_value?: number | null
          created_at?: string
          disbursement_date?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          guarantor_relation?: string | null
          id?: string
          interest_rate: number
          loan_number: string
          loan_officer_id?: string | null
          loan_product_id: string
          maturity_date?: string | null
          monthly_income?: number | null
          monthly_payment: number
          outstanding_amount?: number | null
          outstanding_principal?: number | null
          principal: number
          processing_fee?: number | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          term_months: number
          total_amount: number
          total_interest?: number | null
          updated_at?: string
        }
        Update: {
          application_date?: string | null
          approval_date?: string | null
          approved_by?: string | null
          borrower_address?: string | null
          borrower_email?: string | null
          borrower_name?: string
          borrower_national_id?: string | null
          borrower_phone?: string | null
          branch_id?: string | null
          collateral_description?: string | null
          collateral_type?: string | null
          collateral_value?: number | null
          created_at?: string
          disbursement_date?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          guarantor_relation?: string | null
          id?: string
          interest_rate?: number
          loan_number?: string
          loan_officer_id?: string | null
          loan_product_id?: string
          maturity_date?: string | null
          monthly_income?: number | null
          monthly_payment?: number
          outstanding_amount?: number | null
          outstanding_principal?: number | null
          principal?: number
          processing_fee?: number | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          term_months?: number
          total_amount?: number
          total_interest?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_loan_product_id_fkey"
            columns: ["loan_product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          received_by: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          received_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_rates: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          fixed_amount: number | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number | null
          rate: number
          rate_name: string
          rate_type: string
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_to?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate: number
          rate_name: string
          rate_type: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate?: number
          rate_name?: string
          rate_type?: string
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          approved_by: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          id: string
          pay_date: string
          pay_period: string
          status: string | null
          total_gross: number | null
          total_napsa_employee: number | null
          total_napsa_employer: number | null
          total_net: number | null
          total_nhima: number | null
          total_paye: number | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          pay_date: string
          pay_period: string
          status?: string | null
          total_gross?: number | null
          total_napsa_employee?: number | null
          total_napsa_employer?: number | null
          total_net?: number | null
          total_nhima?: number | null
          total_paye?: number | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          pay_date?: string
          pay_period?: string
          status?: string | null
          total_gross?: number | null
          total_napsa_employee?: number | null
          total_napsa_employer?: number | null
          total_net?: number | null
          total_nhima?: number | null
          total_paye?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          allowances: number | null
          basic_salary: number | null
          created_at: string
          employee_id: string
          gross_pay: number | null
          id: string
          napsa_employee: number | null
          napsa_employer: number | null
          net_pay: number | null
          nhima: number | null
          other_deductions: number | null
          overtime: number | null
          paye: number | null
          payroll_run_id: string
        }
        Insert: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string
          employee_id: string
          gross_pay?: number | null
          id?: string
          napsa_employee?: number | null
          napsa_employer?: number | null
          net_pay?: number | null
          nhima?: number | null
          other_deductions?: number | null
          overtime?: number | null
          paye?: number | null
          payroll_run_id: string
        }
        Update: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string
          employee_id?: string
          gross_pay?: number | null
          id?: string
          napsa_employee?: number | null
          napsa_employer?: number | null
          net_pay?: number | null
          nhima?: number | null
          other_deductions?: number | null
          overtime?: number | null
          paye?: number | null
          payroll_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          reorder_level: number | null
          selling_price: number | null
          sku: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reorder_level?: number | null
          selling_price?: number | null
          sku: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reorder_level?: number | null
          selling_price?: number | null
          sku?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_cost: number | null
          branch_id: string | null
          budget: number | null
          city: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          progress: number | null
          project_type: Database["public"]["Enums"]["project_type"] | null
          site_address: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          branch_id?: string | null
          budget?: number | null
          city?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          progress?: number | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          site_address?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          branch_id?: string | null
          budget?: number | null
          city?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          progress?: number | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          site_address?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number: string
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          branch_id: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_employee: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "accountant"
        | "sales"
        | "technician"
        | "loan_officer"
        | "hr"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      loan_status:
        | "pending"
        | "approved"
        | "active"
        | "completed"
        | "defaulted"
        | "rejected"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "mobile_money"
        | "cheque"
        | "card"
      project_status:
        | "planning"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      project_type: "construction" | "solar" | "maintenance" | "other"
      stock_movement_type: "in" | "out" | "adjustment" | "transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "manager",
        "accountant",
        "sales",
        "technician",
        "loan_officer",
        "hr",
      ],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partial",
        "overdue",
        "cancelled",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      loan_status: [
        "pending",
        "approved",
        "active",
        "completed",
        "defaulted",
        "rejected",
      ],
      payment_method: [
        "cash",
        "bank_transfer",
        "mobile_money",
        "cheque",
        "card",
      ],
      project_status: [
        "planning",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      project_type: ["construction", "solar", "maintenance", "other"],
      stock_movement_type: ["in", "out", "adjustment", "transfer"],
    },
  },
} as const
