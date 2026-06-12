import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "tags" | "url";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  default?: any;
};

type Props = {
  table: string;
  title: string;
  fields: Field[];
  renderRow: (row: any) => React.ReactNode;
  order?: { column: string; asc: boolean };
};

export function ResourceManager({ table, title, fields, renderRow, order }: Props) {
  const qc = useQueryClient();
  const queryKey = [`admin-${table}`];

  const { data: rows = [], isLoading } = useQuery<any[]>({
    queryKey,
    queryFn: async () => {
      const col = order?.column ?? "created_at";
      const asc = order?.asc ?? false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(table).select("*").order(col, { ascending: asc });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  const save = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      if (editing?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from(table).update(values).eq("id", editing.id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from(table).insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success(editing?.id ? "Updated" : "Created");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  function openAdd() { setEditing({}); setOpen(true); }
  function openEdit(row: any) { setEditing(row); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{rows.length} item{rows.length === 1 ? "" : "s"}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      <Card className="bg-card border-border divide-y divide-border">
        {isLoading && <div className="p-10 text-center text-muted-foreground">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">Nothing here yet — click Add to create one.</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">{renderRow(r)}</div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => { if (confirm("Delete this item?")) remove.mutate(r.id); }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <ResourceDialog
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}
        fields={fields}
        title={`${editing?.id ? "Edit" : "New"} ${title.replace(/s$/, "")}`}
        initial={editing ?? {}}
        onSubmit={(v) => save.mutate(v)}
        submitting={save.isPending}
      />
    </div>
  );
}

function ResourceDialog({
  open, onOpenChange, fields, title, initial, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fields: Field[];
  title: string;
  initial: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => seedValues(fields, initial));

  function set<K extends string>(k: K, v: any) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const out: Record<string, any> = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (f.type === "number") {
        out[f.name] = raw === "" || raw === null || raw === undefined ? null : Number(raw);
      } else if (f.type === "tags") {
        out[f.name] = typeof raw === "string"
          ? raw.split(",").map((s) => s.trim()).filter(Boolean)
          : (raw ?? []);
      } else if (f.type === "boolean") {
        out[f.name] = !!raw;
      } else {
        out[f.name] = raw === "" ? null : raw;
      }
      if (f.required && (out[f.name] === null || out[f.name] === undefined || out[f.name] === "")) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    onSubmit(out);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) setValues(seedValues(fields, initial));
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <Label htmlFor={f.name}>
                {f.label}{f.required && <span className="text-destructive"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  rows={4}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : f.type === "boolean" ? (
                <div className="flex items-center gap-2">
                  <Switch
                    id={f.name}
                    checked={!!values[f.name]}
                    onCheckedChange={(v) => set(f.name, v)}
                  />
                  <span className="text-sm text-muted-foreground">{values[f.name] ? "Yes" : "No"}</span>
                </div>
              ) : f.type === "number" ? (
                <Input
                  id={f.name}
                  type="number"
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "url" ? "url" : "text"}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder ?? (f.type === "tags" ? "comma, separated" : undefined)}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function seedValues(fields: Field[], initial: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const f of fields) {
    let v = initial?.[f.name];
    if (v === undefined || v === null) v = f.default ?? "";
    if (f.type === "tags" && Array.isArray(v)) v = v.join(", ");
    out[f.name] = v;
  }
  return out;
}
