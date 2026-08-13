'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MedicineForm } from './medicine-form';
import { CreateMedicineInput } from '@/lib/validations/pharmacy';

interface MedicineRecord {
  id: string;
  code: string;
  genericName: string;
  brandName: string | null;
  dosageForm: string;
  strength: string;
  manufacturer: string | null;
  reorderLevel: number;
  isActive: boolean;
}

interface PharmacyListClientProps {
  medicines: MedicineRecord[];
}

export function PharmacyListClient({ medicines }: PharmacyListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredMedicines = medicines.filter((m) => {
    const query = search.toLowerCase();
    return (
      m.genericName.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query) ||
      (m.brandName && m.brandName.toLowerCase().includes(query))
    );
  });

  const handleCreateMedicine = async (data: CreateMedicineInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to add medicine');
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
          <h1 className="text-2xl font-bold tracking-tight">Pharmacy & Medicine Catalog</h1>
          <p className="text-sm text-muted-foreground">Manage pharmaceutical inventory, generic & brand catalog, reorder levels, and dispensing.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button onClick={() => setIsSheetOpen(true)}>Add New Medicine</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Add Medicine Catalog Entry</SheetTitle>
            </SheetHeader>
            <MedicineForm
              onSubmit={handleCreateMedicine}
              isLoading={isLoading}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Filter by code, generic or brand name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Generic Name</TableHead>
              <TableHead>Brand Name</TableHead>
              <TableHead>Form & Strength</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No medicines found in catalog.
                </TableCell>
              </TableRow>
            ) : (
              filteredMedicines.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs font-semibold">{m.code}</TableCell>
                  <TableCell className="font-medium">{m.genericName}</TableCell>
                  <TableCell>{m.brandName || 'N/A'}</TableCell>
                  <TableCell>{m.dosageForm} ({m.strength})</TableCell>
                  <TableCell>{m.manufacturer || 'N/A'}</TableCell>
                  <TableCell className="font-mono">{m.reorderLevel} units</TableCell>
                  <TableCell>
                    <Badge variant={m.isActive ? 'default' : 'secondary'}>
                      {m.isActive ? 'Active' : 'Inactive'}
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
