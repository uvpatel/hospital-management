'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateMedicineInput } from '@/lib/validations/pharmacy';

interface MedicineFormProps {
  onSubmit: (data: CreateMedicineInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function MedicineForm({ onSubmit, isLoading, onCancel }: MedicineFormProps) {
  const [formData, setFormData] = useState<CreateMedicineInput>({
    code: '',
    genericName: '',
    brandName: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: '',
    reorderLevel: 10,
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to save medicine');
    }
  };

  const handleChange = (field: keyof CreateMedicineInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm rounded bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="e.g. MED-PAR"
            required
          />
        </div>
        <div>
          <Label htmlFor="genericName">Generic Name *</Label>
          <Input
            id="genericName"
            value={formData.genericName}
            onChange={(e) => handleChange('genericName', e.target.value)}
            placeholder="e.g. Paracetamol"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            value={formData.brandName || ''}
            onChange={(e) => handleChange('brandName', e.target.value)}
            placeholder="e.g. Tylenol"
          />
        </div>
        <div>
          <Label htmlFor="dosageForm">Dosage Form *</Label>
          <Input
            id="dosageForm"
            value={formData.dosageForm}
            onChange={(e) => handleChange('dosageForm', e.target.value)}
            placeholder="e.g. Tablet, Syrup, Injection"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="strength">Strength *</Label>
          <Input
            id="strength"
            value={formData.strength}
            onChange={(e) => handleChange('strength', e.target.value)}
            placeholder="e.g. 500mg"
            required
          />
        </div>
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer || ''}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="reorderLevel">Reorder Level *</Label>
          <Input
            id="reorderLevel"
            type="number"
            value={formData.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', parseInt(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Add Medicine'}
        </Button>
      </div>
    </form>
  );
}
