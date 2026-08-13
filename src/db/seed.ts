import 'dotenv/config';
import { db } from './index';
import { hospitalSettings, roles, users, userRoles, patients, departments, doctors, appointments, encounters, diagnoses, prescriptions, prescriptionItems, wards, rooms, beds, admissions, bedAllocations, labTests, medicines, medicineBatches, chargeCatalog, invoices, invoiceItems, payments } from './schema';
import { hashPassword } from '../lib/auth/password';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Starting seed...');

  // 1. Hospital Settings
  await db.insert(hospitalSettings).values({
    hospitalName: 'General Hospital',
    registrationNumber: 'GH-1001',
    phone: '555-0100',
    email: 'contact@generalhospital.example.com',
    addressLine1: '123 Main St',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  }).onConflictDoNothing();
  console.log('Hospital settings seeded.');

  // 2. Roles
  const insertedRoles = await db.insert(roles).values([
    { code: 'admin', name: 'Administrator', description: 'System Administrator' },
    { code: 'doctor', name: 'Doctor', description: 'Medical Professional' },
    { code: 'nurse', name: 'Nurse', description: 'Nursing Staff' },
    { code: 'receptionist', name: 'Receptionist', description: 'Front Desk' },
  ]).onConflictDoNothing().returning();
  console.log('Roles seeded.');

  // 3. Users
  const hashedPassword = await hashPassword('password123');

  const [admin] = await db.insert(users).values({
    email: 'admin@example.com',
    passwordHash: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    status: 'active',
  }).onConflictDoNothing().returning();

  const adminRole = insertedRoles.find(r => r.code === 'admin') || (await db.select().from(roles).where(eq(roles.code, 'admin')))[0];

  if (admin && adminRole) {
    await db.insert(userRoles).values({
      userId: admin.id,
      roleId: adminRole.id,
    }).onConflictDoNothing();
  }

  console.log('Admin user seeded.');

  // 4. Patients
  await db.insert(patients).values([
    {
      patientNumber: 'PAT-20260813-1001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      bloodGroup: 'O+',
      phone: '555-0199',
      email: 'john.doe@example.com',
      addressLine1: '456 Oak Street',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10002',
      country: 'USA',
      emergencyContactName: 'Jane Doe',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '555-0198',
      allergies: 'Penicillin',
      medicalAlerts: 'High Blood Pressure',
    },
    {
      patientNumber: 'PAT-20260813-1002',
      firstName: 'Sarah',
      lastName: 'Smith',
      dateOfBirth: '1992-11-20',
      gender: 'female',
      bloodGroup: 'A+',
      phone: '555-0244',
      email: 'sarah.smith@example.com',
      addressLine1: '789 Pine Ave',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10003',
      country: 'USA',
      emergencyContactName: 'Robert Smith',
      emergencyContactRelationship: 'Father',
      emergencyContactPhone: '555-0245',
    },
  ]).onConflictDoNothing();
  console.log('Patients seeded.');

  // 5. Departments
  const [cardiology] = await db.insert(departments).values([
    { code: 'CARD', name: 'Cardiology', description: 'Heart and cardiovascular care' },
    { code: 'ORTHO', name: 'Orthopedics', description: 'Bone and joint specialists' },
    { code: 'PEDI', name: 'Pediatrics', description: 'Child and adolescent healthcare' },
  ]).onConflictDoNothing().returning();

  const dept = cardiology || (await db.select().from(departments).where(eq(departments.code, 'CARD')))[0];

  // 6. Doctors
  if (dept) {
    await db.insert(doctors).values([
      {
        doctorCode: 'DOC-101',
        registrationNumber: 'REG-CARD-001',
        firstName: 'Alexander',
        lastName: 'Fleming',
        phone: '555-0301',
        email: 'alex.fleming@hospital.example.com',
        specialization: 'Cardiologist',
        qualification: 'MD, FACC',
        consultationFee: '150.00',
        departmentId: dept.id,
      },
    ]).onConflictDoNothing();
  }
  console.log('Departments and Doctors seeded.');

  // 7. Appointments
  const [patient] = await db.select().from(patients).limit(1);
  const [doctor] = await db.select().from(doctors).limit(1);

  if (patient && doctor && admin) {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    await db.insert(appointments).values({
      appointmentNumber: 'APT-20260813-1001',
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      status: 'scheduled',
      reason: 'Chest pain and routine consultation',
      bookedBy: admin.id,
    }).onConflictDoNothing();
  }
  console.log('Appointments seeded.');

  // 8. Encounters & Prescriptions
  const [apt] = await db.select().from(appointments).limit(1);
  if (patient && doctor && apt) {
    const [enc] = await db.insert(encounters).values({
      encounterNumber: 'ENC-20260813-1001',
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentId: apt.id,
      status: 'in_progress',
      chiefComplaint: 'Chest tightness and shortness of breath',
      history: 'No past cardiac history',
      examinationNotes: 'BP: 120/80, Pulse: 72 bpm',
      treatmentPlan: 'Rest, ECG test, prescribed pain relief',
    }).onConflictDoNothing().returning();

    if (enc) {
      await db.insert(diagnoses).values({
        encounterId: enc.id,
        code: 'I20.9',
        description: 'Angina pectoris, unspecified',
        isPrimary: true,
      });

      const [rx] = await db.insert(prescriptions).values({
        prescriptionNumber: 'RX-20260813-1001',
        encounterId: enc.id,
        patientId: patient.id,
        doctorId: doctor.id,
        status: 'active',
        notes: 'Take with food',
      }).onConflictDoNothing().returning();

      if (rx) {
        await db.insert(prescriptionItems).values({
          prescriptionId: rx.id,
          medicineNameSnapshot: 'Aspirin 81mg',
          dosage: '1 tablet',
          route: 'Oral',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
        });
      }
    }
  }
  console.log('Encounters and Prescriptions seeded.');

  // 9. Wards, Rooms, Beds & Admissions
  const [icuWard] = await db.insert(wards).values([
    { code: 'ICU', name: 'Intensive Care Unit', type: 'ICU' },
    { code: 'GEN', name: 'General Ward', type: 'General' },
  ]).onConflictDoNothing().returning();

  const activeWard = icuWard || (await db.select().from(wards).where(eq(wards.code, 'ICU')))[0];

  if (activeWard) {
    const [room101] = await db.insert(rooms).values({
      wardId: activeWard.id,
      roomNumber: '101',
      roomType: 'ICU Private',
      dailyRate: '250.00',
    }).onConflictDoNothing().returning();

    const activeRoom = room101 || (await db.select().from(rooms).where(eq(rooms.roomNumber, '101')))[0];

    if (activeRoom) {
      const [bedA] = await db.insert(beds).values([
        { roomId: activeRoom.id, bedNumber: '101-A', status: 'occupied' },
        { roomId: activeRoom.id, bedNumber: '101-B', status: 'available' },
      ]).onConflictDoNothing().returning();

      if (patient && doctor && admin && bedA) {
        const [adm] = await db.insert(admissions).values({
          admissionNumber: 'ADM-20260813-1001',
          patientId: patient.id,
          attendingDoctorId: doctor.id,
          status: 'admitted',
          admissionReason: 'Severe cardiac observation',
          createdBy: admin.id,
        }).onConflictDoNothing().returning();

        if (adm) {
          await db.insert(bedAllocations).values({
            admissionId: adm.id,
            bedId: bedA.id,
            allocatedBy: admin.id,
          }).onConflictDoNothing();
        }
      }
    }
  }
  console.log('Wards, Rooms, Beds, and Admissions seeded.');

  // 10. Lab Tests & Pharmacy Catalog
  await db.insert(labTests).values([
    { code: 'CBC', name: 'Complete Blood Count', sampleType: 'Blood', price: '35.00', referenceRange: '4.5 - 11.0 k/uL', unit: 'k/uL' },
    { code: 'ECG', name: 'Electrocardiogram', sampleType: 'Electrode', price: '60.00' },
    { code: 'LIPID', name: 'Lipid Panel', sampleType: 'Blood', price: '45.00', referenceRange: '< 200 mg/dL', unit: 'mg/dL' },
  ]).onConflictDoNothing();

  const [asp] = await db.insert(medicines).values([
    { code: 'MED-ASP', genericName: 'Aspirin', brandName: 'Bayer', dosageForm: 'Tablet', strength: '81mg', manufacturer: 'Bayer AG', reorderLevel: 50 },
    { code: 'MED-AMX', genericName: 'Amoxicillin', brandName: 'Amoxil', dosageForm: 'Capsule', strength: '500mg', manufacturer: 'GlaxoSmithKline', reorderLevel: 20 },
  ]).onConflictDoNothing().returning();

  const med = asp || (await db.select().from(medicines).where(eq(medicines.code, 'MED-ASP')))[0];

  if (med) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    await db.insert(medicineBatches).values({
      medicineId: med.id,
      batchNumber: 'BAT-2026-001',
      expiryDate: futureDate,
      purchasePrice: '1.20',
      salePrice: '3.50',
      quantityReceived: 500,
      quantityAvailable: 500,
    }).onConflictDoNothing();
  }

  console.log('Lab Tests, Medicines, and Batches seeded.');

  // 11. Charge Catalog, Invoices & Payments
  await db.insert(chargeCatalog).values([
    { code: 'CHG-CONSULT', name: 'General OPD Consultation', category: 'Consultation', defaultAmount: '100.00' },
    { code: 'CHG-ICU-DAY', name: 'ICU Per Day Rate', category: 'Inpatient', defaultAmount: '250.00' },
    { code: 'CHG-ECG', name: 'ECG Diagnostic Test', category: 'Laboratory', defaultAmount: '60.00' },
  ]).onConflictDoNothing();

  if (patient && admin) {
    const [inv] = await db.insert(invoices).values({
      invoiceNumber: 'INV-20260813-1001',
      patientId: patient.id,
      status: 'partially_paid',
      issuedAt: new Date(),
      subtotal: '160.00',
      discountTotal: '0.00',
      taxTotal: '0.00',
      grandTotal: '160.00',
      amountPaid: '100.00',
      balanceDue: '60.00',
      createdBy: admin.id,
    }).onConflictDoNothing().returning();

    if (inv) {
      await db.insert(invoiceItems).values([
        {
          invoiceId: inv.id,
          descriptionSnapshot: 'General OPD Consultation',
          quantity: '1.00',
          unitPrice: '100.00',
          discountAmount: '0.00',
          taxAmount: '0.00',
          lineTotal: '100.00',
        },
        {
          invoiceId: inv.id,
          descriptionSnapshot: 'ECG Diagnostic Test',
          quantity: '1.00',
          unitPrice: '60.00',
          discountAmount: '0.00',
          taxAmount: '0.00',
          lineTotal: '60.00',
        },
      ]);

      await db.insert(payments).values({
        paymentNumber: 'PAY-20260813-1001',
        invoiceId: inv.id,
        amount: '100.00',
        paymentMethod: 'cash',
        status: 'completed',
        receivedBy: admin.id,
      });
    }
  }
  console.log('Charge Catalog, Invoices, and Payments seeded.');

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
