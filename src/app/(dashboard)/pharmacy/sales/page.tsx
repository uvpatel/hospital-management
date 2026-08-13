import { findDispensations } from '@/db/queries/pharmacy';
import { requirePermission } from '@/lib/auth/rbac';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  await requirePermission('pharmacy.read');
  const dispensations = await findDispensations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pharmacy Dispensing Sales</h1>
        <p className="text-sm text-muted-foreground">Historical records of dispensed prescription medications.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispensation ID</TableHead>
              <TableHead>Dispensed At</TableHead>
              <TableHead>Patient ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispensations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              dispensations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-semibold">{d.id}</TableCell>
                  <TableCell className="text-sm">{new Date(d.dispensedAt).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{d.patientId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
