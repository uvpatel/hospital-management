import { pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodGroupEnum = pgEnum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']);
export const encounterStatusEnum = pgEnum('encounter_status', ['in_progress', 'completed']);
export const admissionStatusEnum = pgEnum('admission_status', ['admitted', 'discharged', 'cancelled']);
export const bedStatusEnum = pgEnum('bed_status', ['available', 'occupied', 'maintenance']);
export const labOrderStatusEnum = pgEnum('lab_order_status', ['ordered', 'collected', 'processing', 'completed', 'cancelled']);
export const prescriptionStatusEnum = pgEnum('prescription_status', ['active', 'completed', 'cancelled']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'issued', 'partially_paid', 'paid', 'void']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'bank_transfer', 'insurance', 'other']);
export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', ['receive', 'dispense', 'adjustment', 'return']);
export const documentTypeEnum = pgEnum('document_type', ['id_proof', 'lab_report', 'prescription', 'other']);
