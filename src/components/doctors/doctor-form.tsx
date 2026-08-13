'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateDoctorInput } from '@/lib/validations/clinical';

interface DoctorFormProps {
  departments: { id: string; name: string }[];
  onSubmit: (data: CreateDoctorInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function DoctorForm({ departments, onSubmit, isLoading, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState<CreateDoctorInput>({
    departmentId: departments[0]?.id || '',
    registrationNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: '',
    qualification: '',
    consultationFee: 100,
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to save doctor');
    }
  };

  const handleChange = (field: keyof CreateDoctorInput, value: string | number) => {
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
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="registrationNumber">Registration # *</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="departmentId">Department *</Label>
          <Select
            value={formData.departmentId}
            onValueChange={(val: string | null) => val && handleChange('departmentId', val)}
          >
            <SelectTrigger id="departmentId">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="specialization">Specialization *</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
            placeholder="e.g. Cardiologist"
            required
          />
        </div>
        <div>
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            id="qualification"
            value={formData.qualification || ''}
            onChange={(e) => handleChange('qualification', e.target.value)}
            placeholder="e.g. MD, MBBS"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="consultationFee">Consultation Fee ($) *</Label>
          <Input
            id="consultationFee"
            type="number"
            value={formData.consultationFee}
            onChange={(e) => handleChange('consultationFee', parseFloat(e.target.value) || 0)}
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
          {isLoading ? 'Saving...' : 'Add Doctor'}
        </Button>
      </div>
    </form>
  );
}
