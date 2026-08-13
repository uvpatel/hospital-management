'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { InvoiceForm } from './invoice-form';
import { CreateInvoiceInput } from '@/lib/validations/billing';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'void';
  currencyCode: string;
  grandTotal: string;
  amountPaid: string;
  balanceDue: string;
  createdAt: Date;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientNumber: string;
}

interface InvoiceListClientProps {
  invoices: InvoiceRecord[];
  patients: { id: string; name: string; patientNumber: string }[];
  chargeCatalog: { id: string; code: string; name: string; defaultAmount: string }[];
}

export function InvoiceListClient({ invoices, patients, chargeCatalog }: InvoiceListClientProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = async (data: CreateInvoiceInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to create invoice');
      }

      setIsSheetOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (invoiceId: string, balanceDue: string) => {
    const amountStr = prompt(`Enter payment amount (Balance Due: $${balanceDue}):`, balanceDue);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid payment amount');
      return;
    }

    try {
      const res = await fetch('/api/v1/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount,
          paymentMethod: 'cash',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error?.message || 'Failed to record payment');
      } else {
        router.refresh();
      }
    } catch {
      alert('Error recording payment');
    }
  };

  const getStatusBadge = (status: InvoiceRecord['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-amber-600">Partially Paid</Badge>;
      case 'issued':
        return <Badge variant="outline">Issued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground">Server-calculated authoritative invoices, payments, and balance tracking.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Create New Invoice</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Create Invoice</SheetTitle>
            </SheetHeader>
            <InvoiceForm
              patients={patients}
              chargeCatalog={chargeCatalog}
              onSubmit={handleCreateInvoice}
              isLoading={isLoading}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No invoices generated yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-semibold">{inv.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">
                    {inv.patientFirstName} {inv.patientLastName}
                    <span className="block text-xs text-muted-foreground">{inv.patientNumber}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono font-medium">${inv.grandTotal}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">${inv.amountPaid}</TableCell>
                  <TableCell className="font-mono font-semibold">${inv.balanceDue}</TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    {inv.status !== 'paid' && inv.status !== 'void' && (
                      <Button size="sm" variant="outline" onClick={() => handleRecordPayment(inv.id, inv.balanceDue)}>
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
