import { getPatientByIdService } from '@/lib/services/patient.service';
import { requirePermission } from '@/lib/auth/rbac';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  await requirePermission('patients.read');
  const { id } = await params;

  let patient;
  try {
    patient = await getPatientByIdService(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ''}{patient.lastName}
            </h1>
            <Badge variant={patient.isActive ? 'default' : 'secondary'}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm font-mono text-muted-foreground mt-1">Patient Number: {patient.patientNumber}</p>
        </div>
        <Link href="/patients" className="inline-flex items-center justify-center rounded-md border border-input bg-background h-9 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          Back to Patients
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Date of Birth</span>
              <span className="font-medium">{patient.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Gender</span>
              <span className="font-medium capitalize">{patient.gender}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Blood Group</span>
              <span className="font-medium">{patient.bloodGroup || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Alternate Phone</span>
              <span className="font-medium">{patient.alternatePhone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Email</span>
              <span className="font-medium">{patient.email || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block">Address</span>
              <span className="font-medium">
                {patient.addressLine1}
                {patient.addressLine2 ? `, ${patient.addressLine2}` : ''}, {patient.city}, {patient.state} {patient.postalCode}, {patient.country}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block">Name</span>
              <span className="font-medium">{patient.emergencyContactName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Relationship</span>
              <span className="font-medium">{patient.emergencyContactRelationship}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone</span>
              <span className="font-medium">{patient.emergencyContactPhone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{patient.allergies || 'No recorded allergies.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{patient.medicalAlerts || 'No active medical alerts.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
