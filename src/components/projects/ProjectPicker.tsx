import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";

export function ProjectPicker({
  value,
  onChange,
  companyId,
  label = "Project / site",
  optional = true,
}: {
  value: string;
  onChange: (id: string) => void;
  companyId?: string;
  label?: string;
  optional?: boolean;
}) {
  const { data: projects } = useProjects();
  const list = (projects || []).filter((p) => {
    if (!companyId) return true;
    return !p.company_id || p.company_id === companyId;
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || (optional ? "__none__" : undefined)}
        onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select project (optional)" />
        </SelectTrigger>
        <SelectContent>
          {optional && <SelectItem value="__none__">No project</SelectItem>}
          {list.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
              {p.city ? ` · ${p.city}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
