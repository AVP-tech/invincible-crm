"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type CsvContactImportPreview } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ContactCsvImportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<CsvContactImportPreview | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const text = await file.text();
    setCsvText(text);
    setPreview(null);
  }

  async function previewImport() {
    setIsParsing(true);
    const response = await fetch("/api/imports/contacts/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ csvText })
    });
    const payload = await response.json();
    setIsParsing(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not preview the CSV");
      return;
    }

    setPreview(payload.preview);
    toast.success("Import preview ready");
  }

  async function applyImport() {
    if (!preview) return;

    setIsImporting(true);
    const response = await fetch("/api/imports/contacts/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ preview })
    });
    const payload = await response.json();
    setIsImporting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not import contacts");
      return;
    }

    toast.success(`Imported ${payload.result.createdCount + payload.result.updatedCount} contacts`);
    router.push(payload.redirectTo ?? "/contacts");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">CSV import</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Bring your spreadsheet into the CRM</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Upload CSV file
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setCsvText(
                  'Name,Email,Phone,Company,Source,Tags\nRahul Verma,rahul@northline.example.com,+91 98765 44002,Northline Fitness,Instagram,"Follow-up;Operations"\nAisha Khan,aisha@newleaf.example.com,+91 98989 12345,Newleaf Studio,Referral,"Design;Warm"'
                )
              }
            >
              Try sample
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
          </div>

          <Textarea
            className="min-h-[320px] font-mono text-xs"
            placeholder="Paste CSV content here or upload a file"
            value={csvText}
            onChange={(event) => {
              setCsvText(event.target.value);
              setPreview(null);
            }}
          />

          <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
            Expected headers work best with fields like Name, Email, Phone, Company, Source, and Tags. The import preview will detect duplicates before saving.
          </div>

          <Button onClick={previewImport} disabled={isParsing || csvText.trim().length < 8}>
            {isParsing ? "Analyzing..." : "Preview import"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-moss">Preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">See creates, updates, and skips before import</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!preview ? (
            <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600">
              Preview the CSV first so duplicate contacts can be updated or skipped intentionally.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <SummaryCard label="Rows" value={preview.summary.totalRows} />
                <SummaryCard label="Create" value={preview.summary.createCount} />
                <SummaryCard label="Update" value={preview.summary.updateCount} />
                <SummaryCard label="Skip" value={preview.summary.skipCount} />
              </div>

              <div className="overflow-hidden rounded-3xl border border-black/5">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-sand/80 text-left text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Row</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Company</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row) => (
                        <tr key={row.rowNumber} className="border-t border-black/5 bg-white">
                          <td className="px-4 py-3 text-slate-500">{row.rowNumber}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                row.action === "create"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : row.action === "update"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-ink">{row.contact.name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.contact.email ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.contact.companyName ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button onClick={applyImport} disabled={isImporting || preview.summary.totalRows === preview.summary.skipCount}>
                {isImporting ? "Importing..." : "Import contacts"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
