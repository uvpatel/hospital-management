import { getOperationalSummaryService } from '@/lib/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Hotel, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const summary = await getOperationalSummaryService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hospital Executive Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time database metrics across clinical operations, bed occupancy, and revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Total active database records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Total OPD consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IPD Admissions</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAdmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Ward & ICU admissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collected Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary.totalCollectedRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Authoritative payments received</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
