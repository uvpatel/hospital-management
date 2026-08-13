'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PatientForm } from './patient-form';
import { CreatePatientInput } from '@/lib/validations/patient';
import { patients } from '@/db/schema';
import Link from 'next/link';

type PatientRecord = typeof patients.$inferSelect;

interface PatientListClientProps {
  initialData: PatientRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function PatientListClient({ initialData, meta }: PatientListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/patients?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/patients?${params.toString()}`);
  };

  const handleCreatePatient = async (data: CreatePatientInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to create patient');
      }

      setIsSheetOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">Manage and register hospital patients.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Register New Patient</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Register Patient</SheetTitle>
            </SheetHeader>
            <PatientForm
              onSubmit={handleCreatePatient}
              isLoading={isLoading}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by name, patient #, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* Data Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>DOB / Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-xs font-semibold">{patient.patientNumber}</TableCell>
                  <TableCell className="font-medium">
                    {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
                  </TableCell>
                  <TableCell>
                    {patient.dateOfBirth} <span className="capitalize text-muted-foreground">({patient.gender})</span>
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.city}, {patient.state}</TableCell>
                  <TableCell>
                    <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent hover:text-accent-foreground">
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
