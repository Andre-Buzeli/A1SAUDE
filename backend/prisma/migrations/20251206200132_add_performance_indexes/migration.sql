-- CreateTable
CREATE TABLE "sync_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableName" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" DATETIME,
    "lastError" TEXT,
    "establishmentId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "offline_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "tags" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "offline_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "data" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastError" TEXT
);

-- CreateTable
CREATE TABLE "medical_evolutions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "professionalName" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "soapSubjective" TEXT NOT NULL,
    "soapObjective" TEXT NOT NULL,
    "soapAssessment" TEXT NOT NULL,
    "soapPlan" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "finalizedAt" DATETIME,
    "attendanceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medical_evolutions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medical_evolutions_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medical_evolutions_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "birthDate" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Brasileira',
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL,
    "terminationDate" DATETIME,
    "terminationReason" TEXT,
    "contractType" TEXT NOT NULL,
    "baseSalary" REAL NOT NULL,
    "workHours" INTEGER NOT NULL,
    "scaleType" TEXT NOT NULL,
    "bankName" TEXT,
    "bankAgency" TEXT,
    "bankAccount" TEXT,
    "pixKey" TEXT,
    "documents" TEXT,
    "userId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employees_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "clockIn1" DATETIME,
    "clockOut1" DATETIME,
    "clockIn2" DATETIME,
    "clockOut2" DATETIME,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "absentMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "justification" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "time_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vacations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "daysTotal" INTEGER NOT NULL,
    "daysUsed" INTEGER NOT NULL DEFAULT 0,
    "sellDays" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vacations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "expectedReturn" DATETIME,
    "actualReturn" DATETIME,
    "documentNumber" TEXT,
    "documentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "department" TEXT,
    "scaleType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedule_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "shiftStart" TEXT NOT NULL,
    "shiftEnd" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "swappedWith" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_assignments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "work_schedules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "schedule_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "baseSalary" REAL NOT NULL,
    "overtimePay" REAL NOT NULL DEFAULT 0,
    "bonuses" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "inssDeduction" REAL NOT NULL DEFAULT 0,
    "irDeduction" REAL NOT NULL DEFAULT 0,
    "otherDeductions" REAL NOT NULL DEFAULT 0,
    "netSalary" REAL NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "calculatedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "home_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "realizedAt" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "cancellationReason" TEXT,
    "hasRunningWater" BOOLEAN,
    "hasSewage" BOOLEAN,
    "hasGarbageCollection" BOOLEAN,
    "hasElectricity" BOOLEAN,
    "buildingType" TEXT,
    "roomsCount" INTEGER,
    "residentsCount" INTEGER,
    "situationFound" TEXT,
    "patientCondition" TEXT,
    "actionsPerformed" TEXT,
    "orientationsGiven" TEXT,
    "referrals" TEXT,
    "nextVisitDate" DATETIME,
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "home_visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "home_visits_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "surgeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "admissionId" TEXT,
    "procedureCode" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "procedureType" TEXT NOT NULL,
    "laterality" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "surgeonId" TEXT NOT NULL,
    "assistantIds" TEXT,
    "anesthetistId" TEXT,
    "instrumenterId" TEXT,
    "nursingTeam" TEXT,
    "anesthesiaType" TEXT,
    "asaScore" TEXT,
    "preOpNotes" TEXT,
    "preOpExams" TEXT,
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "fastingConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "actualStartTime" DATETIME,
    "actualEndTime" DATETIME,
    "complications" TEXT,
    "bloodLoss" INTEGER,
    "surgicalNotes" TEXT,
    "recoveryNotes" TEXT,
    "materialsUsed" TEXT,
    "specialEquipment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "surgeries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "surgeries_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "imaging_exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "examType" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "bodyRegions" TEXT NOT NULL,
    "laterality" TEXT,
    "clinicalIndication" TEXT NOT NULL,
    "diagnosticHypothesis" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'routine',
    "contrastRequired" BOOLEAN NOT NULL DEFAULT false,
    "contrastType" TEXT,
    "contrastAllergy" BOOLEAN NOT NULL DEFAULT false,
    "claustrophobic" BOOLEAN NOT NULL DEFAULT false,
    "pregnant" BOOLEAN NOT NULL DEFAULT false,
    "pacemaker" BOOLEAN NOT NULL DEFAULT false,
    "metalImplants" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "scheduledFor" DATETIME,
    "room" TEXT,
    "performedAt" DATETIME,
    "performedById" TEXT,
    "technicalNotes" TEXT,
    "findings" TEXT,
    "conclusion" TEXT,
    "impression" TEXT,
    "recommendations" TEXT,
    "reportedById" TEXT,
    "reportedAt" DATETIME,
    "imagesCount" INTEGER NOT NULL DEFAULT 0,
    "imagesUrls" TEXT,
    "dicomStudyUid" TEXT,
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "imaging_exams_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "imaging_exams_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "vaccineCode" TEXT NOT NULL,
    "manufacturer" TEXT,
    "batch" TEXT NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "dose" TEXT NOT NULL,
    "doseNumber" INTEGER NOT NULL DEFAULT 1,
    "applicationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationSite" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignName" TEXT,
    "hasAdverseReaction" BOOLEAN NOT NULL DEFAULT false,
    "adverseReactionDesc" TEXT,
    "adverseReactionDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "postponeReason" TEXT,
    "nextDoseDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vaccinations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vaccinations_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "health_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "establishmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "health_programs_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "exitDate" DATETIME,
    "exitReason" TEXT,
    "programData" TEXT,
    "lastVisitDate" DATETIME,
    "nextVisitDate" DATETIME,
    "riskLevel" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "program_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "health_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "program_enrollments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dental_attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "attendanceType" TEXT NOT NULL,
    "chiefComplaint" TEXT NOT NULL,
    "dentalHistory" TEXT,
    "lastDentalVisit" DATETIME,
    "brushingFrequency" INTEGER,
    "usesFloss" BOOLEAN NOT NULL DEFAULT false,
    "odontogram" TEXT,
    "periodontalExam" TEXT,
    "softTissueExam" TEXT,
    "procedures" TEXT,
    "diagnosis" TEXT,
    "cid10Codes" TEXT,
    "treatmentPlan" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'routine',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "nextVisitDate" DATETIME,
    "nextVisitNotes" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dental_attendances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dental_attendances_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "examCode" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "examCategory" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "clinicalIndication" TEXT NOT NULL,
    "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
    "fastingHours" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "scheduledFor" DATETIME,
    "collectedAt" DATETIME,
    "collectedBy" TEXT,
    "sampleId" TEXT,
    "results" TEXT,
    "referenceValues" TEXT,
    "interpretation" TEXT,
    "isNormal" BOOLEAN,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "criticalAlert" TEXT,
    "analyzedBy" TEXT,
    "analyzedAt" DATETIME,
    "validatedBy" TEXT,
    "validatedAt" DATETIME,
    "observations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_exams_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_exams_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pharmacy_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "establishmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "manufacturer" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "therapeuticClass" TEXT,
    "presentation" TEXT NOT NULL,
    "concentration" TEXT,
    "unit" TEXT NOT NULL,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "controlType" TEXT,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "storageLocation" TEXT,
    "storageConditions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pharmacy_products_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "manufacturingDate" DATETIME,
    "quantity" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "unitCost" REAL,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_batches_productId_fkey" FOREIGN KEY ("productId") REFERENCES "pharmacy_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "batchNumber" TEXT,
    "unitCost" REAL,
    "totalCost" REAL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "destinationUnit" TEXT,
    "sourceUnit" TEXT,
    "patientId" TEXT,
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "pharmacy_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "prescriptionId" TEXT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "scheduledTime" DATETIME NOT NULL,
    "administeredAt" DATETIME,
    "administeredBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "vitalSignsBefore" TEXT,
    "vitalSignsAfter" TEXT,
    "reactions" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_room_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medication_room_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "minor_surgeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "procedureCode" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "procedureType" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "laterality" TEXT,
    "anesthesiaType" TEXT,
    "anesthetic" TEXT,
    "scheduledFor" DATETIME,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "materialsUsed" TEXT,
    "sutureType" TEXT,
    "sutureCount" INTEGER,
    "postProcedureNotes" TEXT,
    "complications" TEXT,
    "returnDate" DATETIME,
    "returnInstructions" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "minor_surgeries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "minor_surgeries_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emergency_attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "triageId" TEXT,
    "arrivalTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivalMode" TEXT NOT NULL,
    "origin" TEXT,
    "manchesterColor" TEXT NOT NULL,
    "chiefComplaint" TEXT NOT NULL,
    "firstContactTime" DATETIME,
    "medicalStartTime" DATETIME,
    "disposition" TEXT,
    "dispositionTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "observationBedId" TEXT,
    "observationStartTime" DATETIME,
    "observationEndTime" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "emergency_attendances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "emergency_attendances_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "icu_admissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "admissionId" TEXT,
    "bedId" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admissionFrom" TEXT NOT NULL,
    "admissionReason" TEXT NOT NULL,
    "admissionDiagnosis" TEXT NOT NULL,
    "apacheScore" INTEGER,
    "sofaScore" INTEGER,
    "sapsScore" INTEGER,
    "attendingPhysicianId" TEXT NOT NULL,
    "ventilationMode" TEXT,
    "sedationLevel" TEXT,
    "vasopressors" TEXT,
    "dischargeDate" DATETIME,
    "dischargeTo" TEXT,
    "dischargeReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lengthOfStay" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "icu_admissions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "icu_admissions_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discharges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "dischargeDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeType" TEXT NOT NULL,
    "physicianId" TEXT NOT NULL,
    "physicianName" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "patientCondition" TEXT NOT NULL,
    "mainDiagnosis" TEXT NOT NULL,
    "mainCid10" TEXT NOT NULL,
    "secondaryDiagnosis" TEXT,
    "secondaryCid10" TEXT,
    "procedures" TEXT,
    "instructions" TEXT,
    "restrictions" TEXT,
    "dietRecommendations" TEXT,
    "activityRecommendations" TEXT,
    "prescriptions" TEXT,
    "returnDate" DATETIME,
    "returnInstructions" TEXT,
    "referrals" TEXT,
    "dischargeSummary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "discharges_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "discharges_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "sync_events_synced_timestamp_idx" ON "sync_events"("synced", "timestamp");

-- CreateIndex
CREATE INDEX "sync_events_establishmentId_synced_idx" ON "sync_events"("establishmentId", "synced");

-- CreateIndex
CREATE INDEX "sync_events_tableName_operation_idx" ON "sync_events"("tableName", "operation");

-- CreateIndex
CREATE INDEX "sync_events_recordId_idx" ON "sync_events"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "offline_cache_key_key" ON "offline_cache"("key");

-- CreateIndex
CREATE INDEX "offline_operations_status_timestamp_idx" ON "offline_operations"("status", "timestamp");

-- CreateIndex
CREATE INDEX "offline_operations_resource_operation_idx" ON "offline_operations"("resource", "operation");

-- CreateIndex
CREATE INDEX "offline_operations_status_idx" ON "offline_operations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employees_registrationNumber_key" ON "employees"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_cpf_key" ON "employees"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_cpf_idx" ON "employees"("cpf");

-- CreateIndex
CREATE INDEX "employees_registrationNumber_idx" ON "employees"("registrationNumber");

-- CreateIndex
CREATE INDEX "employees_establishmentId_isActive_idx" ON "employees"("establishmentId", "isActive");

-- CreateIndex
CREATE INDEX "employees_department_isActive_idx" ON "employees"("department", "isActive");

-- CreateIndex
CREATE INDEX "employees_isActive_idx" ON "employees"("isActive");

-- CreateIndex
CREATE INDEX "employees_admissionDate_idx" ON "employees"("admissionDate");

-- CreateIndex
CREATE UNIQUE INDEX "time_records_employeeId_date_key" ON "time_records"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_assignments_scheduleId_employeeId_date_key" ON "schedule_assignments"("scheduleId", "employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employeeId_referenceMonth_referenceYear_key" ON "payrolls"("employeeId", "referenceMonth", "referenceYear");

-- CreateIndex
CREATE INDEX "home_visits_patientId_scheduledDate_idx" ON "home_visits"("patientId", "scheduledDate");

-- CreateIndex
CREATE INDEX "home_visits_establishmentId_status_idx" ON "home_visits"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "home_visits_status_idx" ON "home_visits"("status");

-- CreateIndex
CREATE INDEX "home_visits_scheduledDate_idx" ON "home_visits"("scheduledDate");

-- CreateIndex
CREATE INDEX "home_visits_priority_idx" ON "home_visits"("priority");

-- CreateIndex
CREATE INDEX "surgeries_patientId_scheduledDate_idx" ON "surgeries"("patientId", "scheduledDate");

-- CreateIndex
CREATE INDEX "surgeries_establishmentId_status_idx" ON "surgeries"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "surgeries_status_idx" ON "surgeries"("status");

-- CreateIndex
CREATE INDEX "surgeries_scheduledDate_idx" ON "surgeries"("scheduledDate");

-- CreateIndex
CREATE INDEX "surgeries_procedureCode_idx" ON "surgeries"("procedureCode");

-- CreateIndex
CREATE INDEX "imaging_exams_patientId_status_idx" ON "imaging_exams"("patientId", "status");

-- CreateIndex
CREATE INDEX "imaging_exams_establishmentId_status_idx" ON "imaging_exams"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "imaging_exams_status_idx" ON "imaging_exams"("status");

-- CreateIndex
CREATE INDEX "imaging_exams_scheduledFor_idx" ON "imaging_exams"("scheduledFor");

-- CreateIndex
CREATE INDEX "imaging_exams_examType_idx" ON "imaging_exams"("examType");

-- CreateIndex
CREATE INDEX "imaging_exams_urgency_idx" ON "imaging_exams"("urgency");

-- CreateIndex
CREATE INDEX "vaccinations_patientId_applicationDate_idx" ON "vaccinations"("patientId", "applicationDate");

-- CreateIndex
CREATE INDEX "vaccinations_establishmentId_status_idx" ON "vaccinations"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "vaccinations_vaccineCode_idx" ON "vaccinations"("vaccineCode");

-- CreateIndex
CREATE INDEX "vaccinations_status_idx" ON "vaccinations"("status");

-- CreateIndex
CREATE INDEX "vaccinations_applicationDate_idx" ON "vaccinations"("applicationDate");

-- CreateIndex
CREATE INDEX "vaccinations_batch_idx" ON "vaccinations"("batch");

-- CreateIndex
CREATE UNIQUE INDEX "health_programs_name_establishmentId_key" ON "health_programs"("name", "establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "program_enrollments_programId_patientId_key" ON "program_enrollments"("programId", "patientId");

-- CreateIndex
CREATE INDEX "lab_exams_patientId_status_idx" ON "lab_exams"("patientId", "status");

-- CreateIndex
CREATE INDEX "lab_exams_establishmentId_status_idx" ON "lab_exams"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "lab_exams_status_idx" ON "lab_exams"("status");

-- CreateIndex
CREATE INDEX "lab_exams_scheduledFor_idx" ON "lab_exams"("scheduledFor");

-- CreateIndex
CREATE INDEX "lab_exams_collectedAt_idx" ON "lab_exams"("collectedAt");

-- CreateIndex
CREATE INDEX "lab_exams_examCategory_idx" ON "lab_exams"("examCategory");

-- CreateIndex
CREATE INDEX "lab_exams_isCritical_idx" ON "lab_exams"("isCritical");

-- CreateIndex
CREATE INDEX "pharmacy_products_establishmentId_isActive_idx" ON "pharmacy_products"("establishmentId", "isActive");

-- CreateIndex
CREATE INDEX "pharmacy_products_category_idx" ON "pharmacy_products"("category");

-- CreateIndex
CREATE INDEX "pharmacy_products_isControlled_idx" ON "pharmacy_products"("isControlled");

-- CreateIndex
CREATE INDEX "pharmacy_products_name_idx" ON "pharmacy_products"("name");

-- CreateIndex
CREATE INDEX "pharmacy_products_barcode_idx" ON "pharmacy_products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_products_code_establishmentId_key" ON "pharmacy_products"("code", "establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "product_batches_productId_batchNumber_key" ON "product_batches"("productId", "batchNumber");

-- CreateIndex
CREATE INDEX "emergency_attendances_patientId_arrivalTime_idx" ON "emergency_attendances"("patientId", "arrivalTime");

-- CreateIndex
CREATE INDEX "emergency_attendances_establishmentId_status_idx" ON "emergency_attendances"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "emergency_attendances_manchesterColor_status_idx" ON "emergency_attendances"("manchesterColor", "status");

-- CreateIndex
CREATE INDEX "emergency_attendances_status_idx" ON "emergency_attendances"("status");

-- CreateIndex
CREATE INDEX "emergency_attendances_arrivalTime_idx" ON "emergency_attendances"("arrivalTime");

-- CreateIndex
CREATE INDEX "icu_admissions_patientId_status_idx" ON "icu_admissions"("patientId", "status");

-- CreateIndex
CREATE INDEX "icu_admissions_establishmentId_status_idx" ON "icu_admissions"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "icu_admissions_bedId_idx" ON "icu_admissions"("bedId");

-- CreateIndex
CREATE INDEX "icu_admissions_status_idx" ON "icu_admissions"("status");

-- CreateIndex
CREATE INDEX "icu_admissions_admissionDate_idx" ON "icu_admissions"("admissionDate");

-- CreateIndex
CREATE INDEX "discharges_patientId_dischargeDate_idx" ON "discharges"("patientId", "dischargeDate");

-- CreateIndex
CREATE INDEX "discharges_establishmentId_status_idx" ON "discharges"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "discharges_admissionId_idx" ON "discharges"("admissionId");

-- CreateIndex
CREATE INDEX "discharges_status_idx" ON "discharges"("status");

-- CreateIndex
CREATE INDEX "discharges_dischargeDate_idx" ON "discharges"("dischargeDate");

-- CreateIndex
CREATE INDEX "admissions_patientId_status_idx" ON "admissions"("patientId", "status");

-- CreateIndex
CREATE INDEX "admissions_bedId_status_idx" ON "admissions"("bedId", "status");

-- CreateIndex
CREATE INDEX "admissions_status_idx" ON "admissions"("status");

-- CreateIndex
CREATE INDEX "admissions_admissionDate_idx" ON "admissions"("admissionDate");

-- CreateIndex
CREATE INDEX "admissions_dischargeDate_idx" ON "admissions"("dischargeDate");

-- CreateIndex
CREATE INDEX "attendances_patientId_startTime_idx" ON "attendances"("patientId", "startTime");

-- CreateIndex
CREATE INDEX "attendances_professionalId_startTime_idx" ON "attendances"("professionalId", "startTime");

-- CreateIndex
CREATE INDEX "attendances_establishmentId_status_idx" ON "attendances"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");

-- CreateIndex
CREATE INDEX "attendances_startTime_idx" ON "attendances"("startTime");

-- CreateIndex
CREATE INDEX "attendances_createdAt_idx" ON "attendances"("createdAt");

-- CreateIndex
CREATE INDEX "attendances_updatedAt_idx" ON "attendances"("updatedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resource_action_idx" ON "audit_logs"("resource", "action");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_ipAddress_idx" ON "audit_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "budgets_establishmentId_year_month_idx" ON "budgets"("establishmentId", "year", "month");

-- CreateIndex
CREATE INDEX "budgets_category_idx" ON "budgets"("category");

-- CreateIndex
CREATE INDEX "budgets_isActive_idx" ON "budgets"("isActive");

-- CreateIndex
CREATE INDEX "disease_notifications_establishmentId_notificationDate_idx" ON "disease_notifications"("establishmentId", "notificationDate");

-- CreateIndex
CREATE INDEX "disease_notifications_diseaseCode_epidemiologicalYear_idx" ON "disease_notifications"("diseaseCode", "epidemiologicalYear");

-- CreateIndex
CREATE INDEX "disease_notifications_investigationStatus_idx" ON "disease_notifications"("investigationStatus");

-- CreateIndex
CREATE INDEX "disease_notifications_notificationDate_idx" ON "disease_notifications"("notificationDate");

-- CreateIndex
CREATE INDEX "disease_notifications_epidemiologicalYear_epidemiologicalWeek_idx" ON "disease_notifications"("epidemiologicalYear", "epidemiologicalWeek");

-- CreateIndex
CREATE INDEX "establishments_cnesCode_idx" ON "establishments"("cnesCode");

-- CreateIndex
CREATE INDEX "establishments_type_isActive_idx" ON "establishments"("type", "isActive");

-- CreateIndex
CREATE INDEX "establishments_isActive_idx" ON "establishments"("isActive");

-- CreateIndex
CREATE INDEX "establishments_createdAt_idx" ON "establishments"("createdAt");

-- CreateIndex
CREATE INDEX "exam_requests_patientId_status_idx" ON "exam_requests"("patientId", "status");

-- CreateIndex
CREATE INDEX "exam_requests_status_idx" ON "exam_requests"("status");

-- CreateIndex
CREATE INDEX "exam_requests_requestedAt_idx" ON "exam_requests"("requestedAt");

-- CreateIndex
CREATE INDEX "exam_requests_scheduledFor_idx" ON "exam_requests"("scheduledFor");

-- CreateIndex
CREATE INDEX "exam_requests_completedAt_idx" ON "exam_requests"("completedAt");

-- CreateIndex
CREATE INDEX "expenses_establishmentId_expenseDate_idx" ON "expenses"("establishmentId", "expenseDate");

-- CreateIndex
CREATE INDEX "expenses_budgetId_idx" ON "expenses"("budgetId");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "expenses_createdAt_idx" ON "expenses"("createdAt");

-- CreateIndex
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "patients"("name");

-- CreateIndex
CREATE INDEX "patients_isActive_idx" ON "patients"("isActive");

-- CreateIndex
CREATE INDEX "patients_createdAt_idx" ON "patients"("createdAt");

-- CreateIndex
CREATE INDEX "patients_updatedAt_idx" ON "patients"("updatedAt");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_status_idx" ON "prescriptions"("patientId", "status");

-- CreateIndex
CREATE INDEX "prescriptions_professionalId_createdAt_idx" ON "prescriptions"("professionalId", "createdAt");

-- CreateIndex
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateIndex
CREATE INDEX "prescriptions_validUntil_idx" ON "prescriptions"("validUntil");

-- CreateIndex
CREATE INDEX "prescriptions_createdAt_idx" ON "prescriptions"("createdAt");

-- CreateIndex
CREATE INDEX "sessions_userId_isActive_idx" ON "sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "sessions"("isActive");

-- CreateIndex
CREATE INDEX "triages_patientId_idx" ON "triages"("patientId");

-- CreateIndex
CREATE INDEX "triages_priority_triageTime_idx" ON "triages"("priority", "triageTime");

-- CreateIndex
CREATE INDEX "triages_triageTime_idx" ON "triages"("triageTime");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_cpf_idx" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_establishmentId_isActive_idx" ON "users"("establishmentId", "isActive");

-- CreateIndex
CREATE INDEX "users_profile_idx" ON "users"("profile");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
