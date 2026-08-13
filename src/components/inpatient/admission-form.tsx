'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateAdmissionInput } from '@/lib/validations/inpatient';

interface AdmissionFormProps {
  patients: { id: string; name: string; patientNumber: string }[];
  doctors: { id: string; name: string; specialization: string }[];
  availableBeds: { id: string; bedNumber: string; roomNumber: string; wardName: string }[];
  onSubmit: (data: CreateAdmissionInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function AdmissionForm({ patients, doctors, availableBeds, onSubmit, isLoading, onCancel }: AdmissionFormProps) {
  const [formData, setFormData] = useState<CreateAdmissionInput>({
    patientId: patients[0]?.id || '',
    attendingDoctorId: doctors[0]?.id || '',
    admissionReason: '',
    bedId: availableBeds[0]?.id || undefined,
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to admit patient');
    }
  };

  const handleChange = (field: keyof CreateAdmissionInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <Select
          value={formData.patientId}
          onValueChange={(val: string | null) => val && handleChange('patientId', val)}
        >
          <SelectTrigger id="patientId">
            <SelectValue placeholder="Select Patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((pat) => (
              <SelectItem key={pat.id} value={pat.id}>
                {pat.name} ({pat.patientNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="attendingDoctorId">Attending Doctor *</Label>
        <Select
          value={formData.attendingDoctorId}
          onValueChange={(val: string | null) => val && handleChange('attendingDoctorId', val)}
        >
          <SelectTrigger id="attendingDoctorId">
            <SelectValue placeholder="Select Attending Doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                Dr. {doc.name} ({doc.specialization})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="bedId">Assign Bed</Label>
        <Select
          value={formData.bedId || 'none'}
          onValueChange={(val: string | null) => handleChange('bedId', !val || val === 'none' ? '' : val)}
        >
          <SelectTrigger id="bedId">
            <SelectValue placeholder="Select Bed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Assign Later</SelectItem>
            {availableBeds.map((bed) => (
              <SelectItem key={bed.id} value={bed.id}>
                {bed.wardName} - Room {bed.roomNumber} (Bed {bed.bedNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="admissionReason">Admission Reason *</Label>
        <Textarea
          id="admissionReason"
          value={formData.admissionReason}
          onChange={(e) => handleChange('admissionReason', e.target.value)}
          placeholder="e.g. Post-operative observation, severe infection"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Admitting...' : 'Admit Patient'}
        </Button>
      </div>
    </form>
  );
}
