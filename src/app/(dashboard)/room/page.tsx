import { findWards } from '@/db/queries/inpatient';
import { requirePermission } from '@/lib/auth/rbac';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function RoomPage() {
  await requirePermission('admissions.read');
  const wardsList = await findWards();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wards & Room Directory</h1>
        <p className="text-sm text-muted-foreground">Inpatient wards, types, and active ward status.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ward Code</TableHead>
              <TableHead>Ward Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wardsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No wards configured.
                </TableCell>
              </TableRow>
            ) : (
              wardsList.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs font-semibold">{w.code}</TableCell>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.type}</TableCell>
                  <TableCell>
                    <Badge variant={w.isActive ? 'default' : 'secondary'}>
                      {w.isActive ? 'Active' : 'Inactive'}
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
