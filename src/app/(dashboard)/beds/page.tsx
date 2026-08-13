import { getAvailableBedsService } from '@/lib/services/inpatient.service';
import { requirePermission } from '@/lib/auth/rbac';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function BedsPage() {
  await requirePermission('admissions.read');
  const availableBeds = await getAvailableBedsService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hospital Beds Directory</h1>
        <p className="text-sm text-muted-foreground">Available beds across all hospital wards and rooms.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bed Number</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Room Number</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableBeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No beds currently available.
                </TableCell>
              </TableRow>
            ) : (
              availableBeds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell className="font-mono text-xs font-semibold">{bed.bedNumber}</TableCell>
                  <TableCell className="font-medium">{bed.wardName}</TableCell>
                  <TableCell>Room {bed.roomNumber}</TableCell>
                  <TableCell className="font-mono">${bed.dailyRate}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-emerald-600">
                      {bed.status}
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
