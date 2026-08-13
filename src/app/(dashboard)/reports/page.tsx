import { getOperationalSummaryService } from '@/lib/services/admin.service';
import { requirePermission } from '@/lib/auth/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await requirePermission('reports.read');
  const summary = await getOperationalSummaryService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hospital Operational & Financial Reports</h1>
        <p className="text-sm text-muted-foreground">Aggregated database metrics, revenue collection, and clinical throughput reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patient Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered active patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">OPD Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled & completed visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">IPD Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalAdmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Inpatient ward admissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collected Revenue (Payments)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-green-600">${summary.totalCollectedRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">Authoritative cash & bank payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Billed Revenue (Invoices)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-blue-600">${summary.totalBilledRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">Authoritative grand totals of paid invoices</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
