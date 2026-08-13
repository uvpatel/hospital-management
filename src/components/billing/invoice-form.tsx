'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateInvoiceInput } from '@/lib/validations/billing';

interface InvoiceFormProps {
  patients: { id: string; name: string; patientNumber: string }[];
  chargeCatalog: { id: string; code: string; name: string; defaultAmount: string }[];
  onSubmit: (data: CreateInvoiceInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function InvoiceForm({ patients, chargeCatalog, onSubmit, isLoading, onCancel }: InvoiceFormProps) {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [items, setItems] = useState<CreateInvoiceInput['items']>([
    {
      descriptionSnapshot: chargeCatalog[0]?.name || 'Consultation Fee',
      quantity: 1,
      unitPrice: parseFloat(chargeCatalog[0]?.defaultAmount || '100'),
      discountAmount: 0,
      taxAmount: 0,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        descriptionSnapshot: 'Service Charge',
        quantity: 1,
        unitPrice: 50,
        discountAmount: 0,
        taxAmount: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        patientId,
        items,
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to create invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm rounded bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="patientId">Select Patient *</Label>
        <Select value={patientId} onValueChange={(val: string | null) => val && setPatientId(val)}>
          <SelectTrigger id="patientId">
            <SelectValue placeholder="Select Patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.patientNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            + Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-muted/20">
            <div className="col-span-5">
              <Label className="text-xs">Description</Label>
              <Input
                value={item.descriptionSnapshot}
                onChange={(e) => updateItem(index, 'descriptionSnapshot', e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                required
              />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Price ($)</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="col-span-2 text-right">
              {items.length > 1 && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
