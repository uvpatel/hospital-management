'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAppointmentInput } from '@/lib/validations/appointment';

interface AppointmentFormProps {
  patients: { id: string; name: string; patientNumber: string }[];
  doctors: { id: string; name: string; specialization: string }[];
  onSubmit: (data: CreateAppointmentInput) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function AppointmentForm({ patients, doctors, onSubmit, isLoading, onCancel }: AppointmentFormProps) {
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 90 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    scheduledStart: defaultStart,
    scheduledEnd: defaultEnd,
    reason: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        ...formData,
        scheduledStart: new Date(formData.scheduledStart).toISOString(),
        scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to book appointment');
    }
  };

  const handleChange = (field: string, value: string) => {
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
        <Label htmlFor="doctorId">Select Doctor *</Label>
        <Select
          value={formData.doctorId}
          onValueChange={(val: string | null) => val && handleChange('doctorId', val)}
        >
          <SelectTrigger id="doctorId">
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                Dr. {doc.name} - {doc.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduledStart">Start Date & Time *</Label>
          <Input
            id="scheduledStart"
            type="datetime-local"
            value={formData.scheduledStart}
            onChange={(e) => handleChange('scheduledStart', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="scheduledEnd">End Date & Time *</Label>
          <Input
            id="scheduledEnd"
            type="datetime-local"
            value={formData.scheduledEnd}
            onChange={(e) => handleChange('scheduledEnd', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Visit</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          placeholder="e.g. Routine checkup, fever"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Booking...' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
}
