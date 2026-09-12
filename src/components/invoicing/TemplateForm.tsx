import { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { DocumentStudio } from "@/components/documents/DocumentStudio";

interface TemplateFormProps {
  template?: InvoiceTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ template, onSuccess }: TemplateFormProps) {
  return <DocumentStudio template={template} onSuccess={onSuccess} />;
}
