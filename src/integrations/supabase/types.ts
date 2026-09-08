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
    PostgrestVersion: "14.5"
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
      assets: {
        Row: {
          asset_number: string
          assigned_to: string | null
          branch_id: string | null
          category: string
          created_at: string
          created_by: string | null
          current_value: number | null
          depreciation_rate: number | null
          description: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"] | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_number: string
          assigned_to?: string | null
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_number?: string
          assigned_to?: string | null
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          clock_in: string | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          created_at: string
          employee_id: string
          hours_worked: number
          id: string
          notes: string | null
          overtime_hours: number
          project_id: string | null
          recorded_by: string | null
          site_name: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          work_date: string
        }
        Insert: {
          clock_in?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          employee_id: string
          hours_worked?: number
          id?: string
          notes?: string | null
          overtime_hours?: number
          project_id?: string | null
          recorded_by?: string | null
          site_name?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Update: {
          clock_in?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          employee_id?: string
          hours_worked?: number
          id?: string
          notes?: string | null
          overtime_hours?: number
          project_id?: string | null
          recorded_by?: string | null
          site_name?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_items: {
        Row: {
          amount: number
          boq_id: string
          created_at: string
          description: string
          id: string
          item_code: string | null
          notes: string | null
          product_id: string | null
          quantity: number
          rate: number
          section_id: string | null
          sort_order: number
          unit: string
          wastage_percent: number
        }
        Insert: {
          amount?: number
          boq_id: string
          created_at?: string
          description: string
          id?: string
          item_code?: string | null
          notes?: string | null
          product_id?: string | null
          quantity?: number
          rate?: number
          section_id?: string | null
          sort_order?: number
          unit?: string
          wastage_percent?: number
        }
        Update: {
          amount?: number
          boq_id?: string
          created_at?: string
          description?: string
          id?: string
          item_code?: string | null
          notes?: string | null
          product_id?: string | null
          quantity?: number
          rate?: number
          section_id?: string | null
          sort_order?: number
          unit?: string
          wastage_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "boq_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_sections: {
        Row: {
          boq_id: string
          code: string | null
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          boq_id: string
          code?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          boq_id?: string
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "boq_sections_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      boqs: {
        Row: {
          boq_number: string
          branch_id: string | null
          company_id: string | null
          contingency_percent: number
          created_at: string
          created_by: string | null
          discipline: string | null
          id: string
          markup_percent: number
          notes: string | null
          project_id: string | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["boq_status"]
          subtotal: number
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          boq_number: string
          branch_id?: string | null
          company_id?: string | null
          contingency_percent?: number
          created_at?: string
          created_by?: string | null
          discipline?: string | null
          id?: string
          markup_percent?: number
          notes?: string | null
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["boq_status"]
          subtotal?: number
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          boq_number?: string
          branch_id?: string | null
          company_id?: string | null
          contingency_percent?: number
          created_at?: string
          created_by?: string | null
          discipline?: string | null
          id?: string
          markup_percent?: number
          notes?: string | null
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["boq_status"]
          subtotal?: number
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boqs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boqs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boqs_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
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
      chart_of_accounts: {
        Row: {
          account_code: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      company_settings: {
        Row: {
          account_name: string | null
          account_number: string | null
          address: string | null
          bank_branch: string | null
          bank_name: string | null
          city: string | null
          company_name: string
          currency: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          tpin: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          city?: string | null
          company_name?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tpin?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          city?: string | null
          company_name?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tpin?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
      contracts: {
        Row: {
          branch_id: string | null
          company_id: string | null
          contract_number: string
          contract_type: string
          counterparty_signatory: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          project_id: string | null
          renewal_reminder_days: number
          retention_percent: number
          signed_by: string | null
          signed_date: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          supplier_id: string | null
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          branch_id?: string | null
          company_id?: string | null
          contract_number: string
          contract_type?: string
          counterparty_signatory?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          renewal_reminder_days?: number
          retention_percent?: number
          signed_by?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id?: string | null
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          branch_id?: string | null
          company_id?: string | null
          contract_number?: string
          contract_type?: string
          counterparty_signatory?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          renewal_reminder_days?: number
          retention_percent?: number
          signed_by?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id?: string | null
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_note_items: {
        Row: {
          created_at: string
          delivery_note_id: string
          description: string
          id: string
          product_id: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          delivery_note_id: string
          description: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          delivery_note_id?: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_note_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          branch_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_number: string
          driver_name: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          received_by: string | null
          received_date: string | null
          status: Database["public"]["Enums"]["delivery_note_status"] | null
          updated_at: string
          vehicle_number: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_number: string
          driver_name?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          received_by?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["delivery_note_status"] | null
          updated_at?: string
          vehicle_number?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_number?: string
          driver_name?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          received_by?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["delivery_note_status"] | null
          updated_at?: string
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      document_files: {
        Row: {
          contract_id: string | null
          created_at: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          uploaded_by: string | null
          version: number
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_files_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          expense_number: string
          id: string
          payee: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          project_id: string | null
          receipt_url: string | null
          reference: string | null
          status: Database["public"]["Enums"]["expense_status"]
          supplier_id: string | null
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_number: string
          id?: string
          payee?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id?: string | null
          receipt_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          supplier_id?: string | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          payee?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id?: string | null
          receipt_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          supplier_id?: string | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_logs: {
        Row: {
          created_at: string
          created_by: string | null
          driver: string | null
          fill_date: string
          fuel_type: string | null
          id: string
          mileage_at_fill: number | null
          notes: string | null
          quantity: number
          receipt_number: string | null
          station: string | null
          total_cost: number
          unit_price: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          driver?: string | null
          fill_date?: string
          fuel_type?: string | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          quantity: number
          receipt_number?: string | null
          station?: string | null
          total_cost: number
          unit_price: number
          vehicle_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          driver?: string | null
          fill_date?: string
          fuel_type?: string | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          quantity?: number
          receipt_number?: string | null
          station?: string | null
          total_cost?: number
          unit_price?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
      invoice_templates: {
        Row: {
          bank_account: string | null
          bank_branch: string | null
          bank_name: string | null
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_tpin: string | null
          created_at: string
          created_by: string | null
          font_family: string | null
          footer_text: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          show_bank_details: boolean | null
          show_logo: boolean | null
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tpin?: string | null
          created_at?: string
          created_by?: string | null
          font_family?: string | null
          footer_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_logo?: boolean | null
          updated_at?: string
        }
        Update: {
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tpin?: string | null
          created_at?: string
          created_by?: string | null
          font_family?: string | null
          footer_text?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_logo?: boolean | null
          updated_at?: string
        }
        Relationships: []
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
          quotation_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          template_id: string | null
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
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
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
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
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
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          is_posted: boolean
          reference: string | null
          total_credit: number
          total_debit: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          entry_number: string
          id?: string
          is_posted?: boolean
          reference?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          is_posted?: boolean
          reference?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days?: number
          employee_id: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      maintenance_records: {
        Row: {
          asset_id: string | null
          completed_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          maintenance_type: string
          mileage_at_service: number | null
          next_service_date: string | null
          next_service_mileage: number | null
          notes: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at: string
          vehicle_id: string | null
          vendor: string | null
        }
        Insert: {
          asset_id?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          maintenance_type?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
          vehicle_id?: string | null
          vendor?: string | null
        }
        Update: {
          asset_id?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          maintenance_type?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
          vehicle_id?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
          notification_prefs: Json
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
          notification_prefs?: Json
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
          notification_prefs?: Json
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
      quotation_items: {
        Row: {
          created_at: string
          description: string
          id: string
          product_id: string | null
          quantity: number | null
          quotation_id: string
          tax_rate: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          quotation_id: string
          tax_rate?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          quotation_id?: string
          tax_rate?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          branch_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          issue_date: string | null
          notes: string | null
          project_id: string | null
          quotation_number: string
          status: Database["public"]["Enums"]["quotation_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          quotation_number: string
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          quotation_number?: string
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      vehicles: {
        Row: {
          assigned_driver: string | null
          branch_id: string | null
          color: string | null
          created_at: string
          created_by: string | null
          current_mileage: number | null
          engine_number: string | null
          fitness_expiry: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          make: string
          model: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          registration_number: string
          status: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity: number | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          assigned_driver?: string | null
          branch_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_mileage?: number | null
          engine_number?: string | null
          fitness_expiry?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          make: string
          model: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          registration_number: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity?: number | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver?: string | null
          branch_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_mileage?: number | null
          engine_number?: string | null
          fitness_expiry?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          make?: string
          model?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          registration_number?: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity?: number | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
      generate_loan_schedule: { Args: { p_loan_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_employee: { Args: { _user_id: string }; Returns: boolean }
      next_document_number: { Args: { p_prefix: string }; Returns: string }
      record_invoice_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_notes?: string | null
          p_payment_date?: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_reference?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "income" | "expense"
      app_role:
        | "admin"
        | "manager"
        | "accountant"
        | "sales"
        | "technician"
        | "loan_officer"
        | "hr"
      asset_status: "active" | "inactive" | "maintenance" | "disposed" | "sold"
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "half_day"
        | "on_leave"
        | "holiday"
      boq_status: "draft" | "priced" | "submitted" | "approved" | "revised"
      contract_status:
        | "draft"
        | "active"
        | "expired"
        | "terminated"
        | "completed"
        | "renewed"
      delivery_note_status: "pending" | "dispatched" | "delivered" | "cancelled"
      expense_status: "pending" | "approved" | "rejected" | "paid"
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
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      loan_status:
        | "pending"
        | "approved"
        | "active"
        | "completed"
        | "defaulted"
        | "rejected"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "overdue"
        | "cancelled"
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
      quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted"
      stock_movement_type: "in" | "out" | "adjustment" | "transfer"
      vehicle_status:
        | "active"
        | "inactive"
        | "maintenance"
        | "accident"
        | "disposed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_type: ["asset", "liability", "equity", "income", "expense"],
      app_role: [
        "admin",
        "manager",
        "accountant",
        "sales",
        "technician",
        "loan_officer",
        "hr",
      ],
      asset_status: ["active", "inactive", "maintenance", "disposed", "sold"],
      attendance_status: [
        "present",
        "absent",
        "late",
        "half_day",
        "on_leave",
        "holiday",
      ],
      boq_status: ["draft", "priced", "submitted", "approved", "revised"],
      contract_status: [
        "draft",
        "active",
        "expired",
        "terminated",
        "completed",
        "renewed",
      ],
      delivery_note_status: ["pending", "dispatched", "delivered", "cancelled"],
      expense_status: ["pending", "approved", "rejected", "paid"],
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
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      loan_status: [
        "pending",
        "approved",
        "active",
        "completed",
        "defaulted",
        "rejected",
      ],
      maintenance_status: [
        "scheduled",
        "in_progress",
        "completed",
        "overdue",
        "cancelled",
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
      quotation_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "converted",
      ],
      stock_movement_type: ["in", "out", "adjustment", "transfer"],
      vehicle_status: [
        "active",
        "inactive",
        "maintenance",
        "accident",
        "disposed",
      ],
    },
  },
} as const
