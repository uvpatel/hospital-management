'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DoctorForm } from './doctor-form';
import { CreateDoctorInput } from '@/lib/validations/clinical';

interface DoctorRecord {
  id: string;
  doctorCode: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialization: string;
  qualification: string | null;
  consultationFee: string;
  isActive: boolean;
  departmentId: string;
  departmentName: string;
  createdAt: Date;
}

interface DoctorListClientProps {
  doctors: DoctorRecord[];
  departments: { id: string; name: string }[];
}

export function DoctorListClient({ doctors, departments }: DoctorListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const query = search.toLowerCase();
    return (
      fullName.includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      doc.departmentName.toLowerCase().includes(query) ||
      doc.doctorCode.toLowerCase().includes(query)
    );
  });

  const handleCreateDoctor = async (data: CreateDoctorInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to create doctor');
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
          <h1 className="text-2xl font-bold tracking-tight">Doctors & Specialists</h1>
          <p className="text-sm text-muted-foreground">Manage hospital medical staff, departments, and consultation rates.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Add New Doctor</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Add Doctor</SheetTitle>
            </SheetHeader>
            <DoctorForm
              departments={departments}
              onSubmit={handleCreateDoctor}
              isLoading={isLoading}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Filter by name, specialization, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone / Email</TableHead>
              <TableHead>Consultation Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No doctors found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono text-xs font-semibold">{doc.doctorCode}</TableCell>
                  <TableCell className="font-medium">
                    Dr. {doc.firstName} {doc.lastName}
                    <span className="block text-xs text-muted-foreground">{doc.qualification}</span>
                  </TableCell>
                  <TableCell>{doc.specialization}</TableCell>
                  <TableCell>{doc.departmentName}</TableCell>
                  <TableCell>
                    {doc.phone}
                    <span className="block text-xs text-muted-foreground">{doc.email}</span>
                  </TableCell>
                  <TableCell className="font-mono font-medium">${doc.consultationFee}</TableCell>
                  <TableCell>
                    <Badge variant={doc.isActive ? 'default' : 'secondary'}>
                      {doc.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
