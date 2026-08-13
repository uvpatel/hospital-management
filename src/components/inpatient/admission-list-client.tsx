'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AdmissionForm } from './admission-form';
import { CreateAdmissionInput } from '@/lib/validations/inpatient';

interface AdmissionRecord {
  id: string;
  admissionNumber: string;
  status: 'admitted' | 'discharged' | 'cancelled';
  admissionReason: string;
  admittedAt: Date;
  dischargedAt: Date | null;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientNumber: string;
  attendingDoctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
}

interface AdmissionListClientProps {
  admissions: AdmissionRecord[];
  patients: { id: string; name: string; patientNumber: string }[];
  doctors: { id: string; name: string; specialization: string }[];
  availableBeds: { id: string; bedNumber: string; roomNumber: string; wardName: string }[];
}

export function AdmissionListClient({ admissions, patients, doctors, availableBeds }: AdmissionListClientProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmission = async (data: CreateAdmissionInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to admit patient');
      }

      setIsSheetOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDischarge = async (id: string) => {
    const summary = prompt('Enter discharge summary:');
    if (!summary) return;

    try {
      const res = await fetch(`/api/v1/admissions/${id}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dischargeSummary: summary }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error?.message || 'Failed to discharge patient');
      } else {
        router.refresh();
      }
    } catch {
      alert('Error discharging patient');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inpatient Admissions & Wards</h1>
          <p className="text-sm text-muted-foreground">Manage IPD patient admissions, bed allocations, and discharge summary workflows.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Admit New Patient</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Inpatient Admission</SheetTitle>
            </SheetHeader>
            <AdmissionForm
              patients={patients}
              doctors={doctors}
              availableBeds={availableBeds}
              onSubmit={handleCreateAdmission}
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
              <TableHead>Admission #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Attending Doctor</TableHead>
              <TableHead>Admitted At</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No active inpatient admissions.
                </TableCell>
              </TableRow>
            ) : (
              admissions.map((adm) => (
                <TableRow key={adm.id}>
                  <TableCell className="font-mono text-xs font-semibold">{adm.admissionNumber}</TableCell>
                  <TableCell className="font-medium">
                    {adm.patientFirstName} {adm.patientLastName}
                    <span className="block text-xs text-muted-foreground">{adm.patientNumber}</span>
                  </TableCell>
                  <TableCell>
                    Dr. {adm.doctorFirstName} {adm.doctorLastName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(adm.admittedAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>{adm.admissionReason}</TableCell>
                  <TableCell>
                    <Badge variant={adm.status === 'admitted' ? 'default' : 'secondary'}>
                      {adm.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {adm.status === 'admitted' && (
                      <Button size="sm" variant="outline" onClick={() => handleDischarge(adm.id)}>
                        Discharge
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
