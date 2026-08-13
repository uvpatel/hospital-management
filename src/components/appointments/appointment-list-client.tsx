'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AppointmentForm } from './appointment-form';
import { CreateAppointmentInput } from '@/lib/validations/appointment';

interface AppointmentRecord {
  id: string;
  appointmentNumber: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string | null;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientNumber: string;
  doctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
}

interface AppointmentListClientProps {
  initialData: AppointmentRecord[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  patients: { id: string; name: string; patientNumber: string }[];
  doctors: { id: string; name: string; specialization: string }[];
}

export function AppointmentListClient({ initialData, meta: _meta, patients, doctors }: AppointmentListClientProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookAppointment = async (data: CreateAppointmentInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to book appointment');
      }

      setIsSheetOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusAction = async (id: string, action: 'check-in' | 'cancel') => {
    try {
      const res = await fetch(`/api/v1/appointments/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error?.message || `Failed to ${action} appointment`);
      } else {
        router.refresh();
      }
    } catch {
      alert(`Error performing ${action}`);
    }
  };

  const getStatusBadge = (status: AppointmentRecord['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'checked_in':
        return <Badge className="bg-blue-600">Checked In</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-600">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments & Scheduling</h1>
          <p className="text-sm text-muted-foreground">Manage OPD patient appointments, check-ins, and status transitions.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Book Appointment</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Book Appointment</SheetTitle>
            </SheetHeader>
            <AppointmentForm
              patients={patients}
              doctors={doctors}
              onSubmit={handleBookAppointment}
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
              <TableHead>Apt #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No appointments booked yet.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-mono text-xs font-semibold">{apt.appointmentNumber}</TableCell>
                  <TableCell className="font-medium">
                    {apt.patientFirstName} {apt.patientLastName}
                    <span className="block text-xs text-muted-foreground">{apt.patientNumber}</span>
                  </TableCell>
                  <TableCell>
                    Dr. {apt.doctorFirstName} {apt.doctorLastName}
                    <span className="block text-xs text-muted-foreground">{apt.doctorSpecialization}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(apt.scheduledStart).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>{apt.reason || 'General Visit'}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {apt.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusAction(apt.id, 'check-in')}>
                        Check-in
                      </Button>
                    )}
                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatusAction(apt.id, 'cancel')}>
                        Cancel
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
