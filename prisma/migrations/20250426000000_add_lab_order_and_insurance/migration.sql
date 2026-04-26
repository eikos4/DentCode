-- Add LabOrder model
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "clinicId" TEXT,
    "patientId" TEXT NOT NULL,
    "labId" TEXT,
    "examType" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resultId" TEXT,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- Add insurance field to Patient
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "insurance" TEXT;

-- Create unique index for resultId
CREATE UNIQUE INDEX IF NOT EXISTS "LabOrder_resultId_key" ON "LabOrder"("resultId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "LabOrder_dentistId_createdAt_idx" ON "LabOrder"("dentistId", "createdAt");
CREATE INDEX IF NOT EXISTS "LabOrder_clinicId_status_idx" ON "LabOrder"("clinicId", "status");
CREATE INDEX IF NOT EXISTS "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- Add foreign keys
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "LabUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
