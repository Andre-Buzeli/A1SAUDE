-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnesCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "emergencyPhone" TEXT,
    "operatingHours" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "establishmentType" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "establishmentName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "birthDate" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "motherName" TEXT,
    "fatherName" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "emergencyContact" TEXT,
    "allergies" TEXT NOT NULL,
    "chronicConditions" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "bloodType" TEXT,
    "height" REAL,
    "weight" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "establishmentId" TEXT NOT NULL,
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "units_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "unitId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "chiefComplaint" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attendances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "status" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "instructions" TEXT,
    "validUntil" DATETIME NOT NULL,
    "digitalSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prescriptions_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prescriptions_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_administrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "attendanceId" TEXT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "scheduledFor" DATETIME,
    "administeredAt" DATETIME,
    "administeredBy" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_administrations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medication_administrations_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "medication_administrations_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "scheduledTimes" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_schedules_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medication_schedules_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exam_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "examType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" DATETIME,
    "completedAt" DATETIME,
    "results" TEXT,
    CONSTRAINT "exam_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exam_requests_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "systolicBP" INTEGER,
    "diastolicBP" INTEGER,
    "heartRate" INTEGER,
    "temperature" REAL,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" REAL,
    "weight" REAL,
    "height" REAL,
    "painScale" INTEGER,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    CONSTRAINT "vital_signs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "triages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "chiefComplaint" TEXT NOT NULL,
    "vitalSigns" TEXT,
    "symptoms" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "triageTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triageBy" TEXT NOT NULL,
    CONSTRAINT "triages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "triages_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "beds_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "beds_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeDate" DATETIME,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "admissions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "admissions_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "beds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attendanceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" TEXT NOT NULL,
    CONSTRAINT "procedures_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "budgetedAmount" REAL NOT NULL,
    "spentAmount" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "budgetId" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "invoiceNumber" TEXT,
    "supplier" TEXT,
    "paymentMethod" TEXT,
    "paymentDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expenses_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalValue" REAL NOT NULL,
    "monthlyValue" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paymentTerms" TEXT,
    "renewalTerms" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contracts_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contracts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disease_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "patientId" TEXT,
    "diseaseCode" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "notificationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "symptomOnsetDate" DATETIME,
    "diagnosisDate" DATETIME,
    "notificationType" TEXT NOT NULL DEFAULT 'compulsory',
    "severity" TEXT,
    "outcome" TEXT,
    "investigationStatus" TEXT NOT NULL DEFAULT 'pending',
    "epidemiologicalWeek" INTEGER NOT NULL,
    "epidemiologicalYear" INTEGER NOT NULL,
    "patientAge" INTEGER,
    "patientGender" TEXT,
    "patientCity" TEXT,
    "patientNeighborhood" TEXT,
    "riskFactors" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "labResults" TEXT NOT NULL,
    "treatmentGiven" TEXT,
    "contactTracing" BOOLEAN NOT NULL DEFAULT false,
    "sinanSent" BOOLEAN NOT NULL DEFAULT false,
    "sinanDate" DATETIME,
    "notes" TEXT,
    "notifiedBy" TEXT NOT NULL,
    "investigatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "disease_notifications_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "disease_notifications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "disease_notifications_notifiedBy_fkey" FOREIGN KEY ("notifiedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "disease_notifications_investigatedBy_fkey" FOREIGN KEY ("investigatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_cnesCode_key" ON "establishments"("cnesCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_key" ON "patients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "triages_attendanceId_key" ON "triages"("attendanceId");

-- CreateIndex
CREATE UNIQUE INDEX "beds_number_unitId_key" ON "beds"("number", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_establishmentId_year_month_category_subcategory_key" ON "budgets"("establishmentId", "year", "month", "category", "subcategory");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_establishmentId_contractNumber_key" ON "contracts"("establishmentId", "contractNumber");
