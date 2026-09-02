"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, UploadCloud } from "lucide-react";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";
import { ImportTransaction } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ImportTransaction[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currency = session?.user?.currency || "INR";

  const validateFile = (f: File): string | null => {
    if (!f.name.endsWith(".csv")) return "Please upload a CSV file.";
    if (f.size > MAX_SIZE) return "File size must be under 5MB.";
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to parse CSV");
        return;
      }

      setTransactions(json.transactions);
      setFileName(file.name);
      setFile(null);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelection = (index: number) => {
    setTransactions((prev) =>
      prev.map((tx, i) => (i === index ? { ...tx, selected: !tx.selected } : tx))
    );
  };

  const toggleAll = () => {
    const allSelected = transactions.every((t) => t.selected);
    setTransactions((prev) => prev.map((t) => ({ ...t, selected: !allSelected })));
  };

  const handleImport = async () => {
    const selected = transactions.filter((t) => t.selected);
    if (selected.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, transactions: selected }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to import transactions");
        setImporting(false);
        return;
      }

      router.push("/transactions");
    } catch {
      setError("Failed to import. Please try again.");
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Statement</h1>
        <p className="text-muted-foreground mt-1">
          Upload a bank statement (CSV) to automatically add multiple transactions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 flex gap-3 text-destructive border border-destructive/20 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Import Error</h4>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Your CSV file should contain Date, Description, and Amount columns.
            </CardDescription>
          </CardHeader>
          <CardContent
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl mx-6 mb-6 transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/20 hover:bg-muted/40"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
              {isDragging ? <UploadCloud className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
            </div>

            {file ? (
              <div className="text-center" onClick={(e) => e.stopPropagation()}>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setFile(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Parsing..." : "Upload & Preview"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium mb-2">
                  {isDragging ? "Drop your file here" : "Drag and drop or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Only .csv files are supported up to 5MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
            <div>
              <h3 className="font-semibold">{transactions.length} transactions found</h3>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setTransactions([])} disabled={importing}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || transactions.filter((t) => t.selected).length === 0}
              >
                {importing
                  ? "Importing..."
                  : `Import ${transactions.filter((t) => t.selected).length} Transactions`}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={transactions.length > 0 && transactions.every((t) => t.selected)}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Category (Auto)</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/30 transition-colors ${
                        !tx.selected ? "opacity-50" : ""
                      } ${tx.isDuplicate ? "bg-orange-500/5" : ""}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={tx.selected}
                          onChange={() => toggleSelection(idx)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{tx.description}</div>
                        {tx.isDuplicate && (
                          <div className="text-[10px] text-orange-500 font-semibold mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Possible Duplicate
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getCategoryColor(tx.category) }}
                          />
                          {tx.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(tx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
