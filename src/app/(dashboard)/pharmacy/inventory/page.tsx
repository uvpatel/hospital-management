import { getMedicineBatchesService } from '@/lib/services/pharmacy.service';
import { requirePermission } from '@/lib/auth/rbac';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  await requirePermission('pharmacy.read');
  const batches = await getMedicineBatchesService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medicine Stock Batches</h1>
        <p className="text-sm text-muted-foreground">Active inventory batches, expiration dates, and available stock units.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch #</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Available Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No stock batches recorded.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs font-semibold">{b.batchNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(b.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono">${b.purchasePrice}</TableCell>
                  <TableCell className="font-mono">${b.salePrice}</TableCell>
                  <TableCell className="font-mono font-bold text-emerald-600">{b.quantityAvailable} units</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
