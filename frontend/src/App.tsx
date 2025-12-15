import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { HospitalDashboard } from '@/pages/hospital/HospitalDashboard'
import { UPADashboard } from '@/pages/upa/UPADashboard'
import { UBSDashboard } from '@/pages/ubs/UBSDashboard'
import { CoordinatorDashboard } from '@/components/coordinator/CoordinatorDashboard'
import { TestMedicalDashboard } from '@/pages/TestMedicalDashboard'
import { DevRoutesPage } from '@/pages/dev/DevRoutesPage'
import { DevPlaceholderPage } from '@/pages/dev/DevPlaceholderPage'
import DevDocsPage from '@/pages/dev/DevDocsPage'
import { PatientListPage } from '@/pages/patients/PatientListPage'
import { PatientFormPage } from '@/pages/patients/PatientFormPage'
import { ActiveAttendancesPage } from '@/pages/attendances/ActiveAttendancesPage'
import { AttendanceDetailPage } from '@/pages/attendances/AttendanceDetailPage'
import { AttendanceNewPage } from '@/pages/attendances/AttendanceNewPage'
import { PrescriptionListPage } from '@/pages/prescriptions/PrescriptionListPage'
import { PrescriptionFormPage } from '@/pages/prescriptions/PrescriptionFormPage'
import { ExamRequestPage } from '@/pages/exams/ExamRequestPage'
import { ExamResultsPage } from '@/pages/exams/ExamResultsPage'
import { ExamRequestFormPage } from '@/pages/exams/ExamRequestFormPage'
import { ExamDetailPage } from '@/pages/exams/ExamDetailPage'
import { TriagePage } from '@/pages/triage/TriagePage'
import { TriageFormPage } from '@/pages/triage/TriageFormPage'
import { MedicationsPage } from '@/pages/medications/MedicationsPage'
import { MedicationSchedulesPage } from '@/pages/medications/MedicationSchedulesPage'
import { MedicationAdministrationFormPage } from '@/pages/medications/MedicationAdministrationFormPage'
import VitalSignsPage from '@/pages/vital-signs/VitalSignsPage'
import VitalSignsFormPage from '@/pages/vital-signs/VitalSignsFormPage'
import VitalSignsTrendsPage from '@/pages/vital-signs/VitalSignsTrendsPage'
import {
  DevPrescriptionsPage,
  DevVitalSignsPage,
  DevAdminReportsPage,
  DevVaccinationsPage,
  DevAppointmentsPage,
  DevBedsPage
} from '@/pages/dev/DevPlaceholderPage'
import PharmacyDashboard from '@/components/pharmacy/PharmacyDashboard'
import { PsychologyDashboard } from '@/components/psychology/PsychologyDashboard'
import { PhysiotherapistDashboard } from '@/components/physiotherapist/PhysiotherapistDashboard'
import GestorGeralDashboard from '@/pages/admin/manager/GestorGeralDashboard'
import GestorLocalDashboard from '@/pages/admin/manager/GestorLocalDashboard'
import GestorTotalDashboard from '@/pages/admin/manager/GestorTotalDashboard'
import AdminManagerLayout from '@/components/layout/AdminManagerLayout'
import LocalStaffPage from '@/pages/admin/manager/LocalStaffPage'
import LocalOperationsPage from '@/pages/admin/manager/LocalOperationsPage'
import LocalReportsPage from '@/pages/admin/manager/LocalReportsPage'
import LocalPatientsPage from '@/pages/admin/manager/LocalPatientsPage'
import LocalSchedulePage from '@/pages/admin/manager/LocalSchedulePage'
import GeralEstablishmentsPage from '@/pages/admin/manager/GeralEstablishmentsPage'
import GeralUsersPage from '@/pages/admin/manager/GeralUsersPage'
import UsersPage from '@/pages/admin/UsersPage'
import EstablishmentsPage from '@/pages/admin/EstablishmentsPage'
import FinancialPage from '@/pages/admin/FinancialPage'
import GeralReportsPage from '@/pages/admin/manager/GeralReportsPage'
import GeralSettingsPage from '@/pages/admin/manager/GeralSettingsPage'
import ProntuarioPage from '@/pages/prontuario/ProntuarioPage'
import TotalAnalyticsPage from '@/pages/admin/manager/TotalAnalyticsPage'
import TotalRegionsPage from '@/pages/admin/manager/TotalRegionsPage'
import TotalStrategicPage from '@/pages/admin/manager/TotalStrategicPage'
import ParticlesBackground from '@/components/ui/ParticlesBackground'
import RHDashboardPage from '@/pages/rh/RHDashboardPage'
import EmployeesPage from '@/pages/rh/EmployeesPage'
import SchedulesPage from '@/pages/rh/SchedulesPage'
import TimeRecordsPage from '@/pages/rh/TimeRecordsPage'
import VacationsPage from '@/pages/rh/VacationsPage'
import PayrollPage from '@/pages/rh/PayrollPage'
import AuditPage from '@/pages/admin/AuditPage'
import HomeVisitsPage from '@/pages/ubs/HomeVisitsPage'
import SurgeryCenterPage from '@/pages/surgery/SurgeryCenterPage'
import ImagingCenterPage from '@/pages/imaging/ImagingCenterPage'
import VaccinationPage from '@/pages/ubs/VaccinationPage'
import HealthProgramsPage from '@/pages/ubs/HealthProgramsPage'
import DentalPage from '@/pages/ubs/DentalPage'
import EmergencyPage from '@/pages/hospital/EmergencyPage'
import ICUPage from '@/pages/hospital/ICUPage'
import LabPage from '@/pages/hospital/LabPage'
import DischargePage from '@/pages/hospital/DischargePage'
import PharmacyStockPage from '@/pages/pharmacy/PharmacyStockPage'
import MedicationRoomPage from '@/pages/upa/MedicationRoomPage'
import MinorSurgeryPage from '@/pages/upa/MinorSurgeryPage'
import DocsViewerPage from '@/pages/docs/DocsViewerPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative min-h-screen bg-bg-primary z-10">
          <ParticlesBackground />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dev routes - Modo desenvolvimento sem autenticação */}
            <Route path="/dev" element={<DevRoutesPage />} />
            <Route path="/dev/docs" element={<DevDocsPage />} />
            <Route path="/dev/docs/view/:docName" element={<DocsViewerPage />} />
            <Route path="/dev/patients" element={<PatientListPage />} />
            <Route path="/dev/patients/new" element={<PatientFormPage />} />
            <Route path="/dev/patients/:id" element={<PatientFormPage />} />
            <Route path="/dev/attendances" element={<ActiveAttendancesPage />} />
            <Route path="/dev/attendances/new" element={<AttendanceNewPage />} />
            <Route path="/dev/attendances/:id" element={<AttendanceDetailPage />} />
            <Route path="/dev/prescriptions" element={<PrescriptionListPage />} />
            <Route path="/dev/prescriptions/new" element={<PrescriptionFormPage />} />
            <Route path="/dev/prescriptions/:id" element={<PrescriptionFormPage />} />
            <Route path="/dev/exams" element={<ExamRequestPage />} />
            <Route path="/dev/exams/new" element={<ExamRequestFormPage />} />
            <Route path="/dev/exams/:id" element={<ExamDetailPage />} />
            <Route path="/dev/exams/results" element={<ExamResultsPage />} />
            <Route path="/dev/triage" element={<TriagePage />} />
            <Route path="/dev/triage/new" element={<TriageFormPage />} />
            <Route path="/dev/medications" element={<MedicationsPage />} />
            <Route path="/dev/medications/new" element={<MedicationAdministrationFormPage />} />
            <Route path="/dev/medications/schedules" element={<MedicationSchedulesPage />} />
            <Route path="/dev/vital-signs" element={<VitalSignsPage />} />
            <Route path="/dev/vital-signs/new" element={<VitalSignsFormPage />} />
            <Route path="/dev/vital-signs/trends/:patientId" element={<VitalSignsTrendsPage />} />
            <Route path="/dev/admin/users" element={<UsersPage />} />
            <Route path="/dev/admin/establishments" element={<EstablishmentsPage />} />
            <Route path="/dev/admin/financial" element={<FinancialPage />} />
            <Route path="/dev/admin/reports" element={<DevAdminReportsPage />} />
            <Route path="/dev/admin/audit" element={<AuditPage />} />
            <Route path="/dev/vaccinations" element={<DevVaccinationsPage />} />
            <Route path="/dev/appointments" element={<DevAppointmentsPage />} />
            <Route path="/dev/beds" element={<DevBedsPage />} />
            <Route path="/dev/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/dev/pharmacy/hospital" element={<PharmacyDashboard />} />
            <Route path="/dev/pharmacy/upa" element={<PharmacyDashboard />} />
            <Route path="/dev/pharmacy/ubs" element={<PharmacyDashboard />} />
            <Route path="/dev/psychology" element={<PsychologyDashboard establishmentType="hospital" />} />
            <Route path="/dev/psychology/hospital" element={<PsychologyDashboard establishmentType="hospital" />} />
            <Route path="/dev/psychology/upa" element={<PsychologyDashboard establishmentType="upa" />} />
            <Route path="/dev/psychology/ubs" element={<PsychologyDashboard establishmentType="ubs" />} />
            <Route path="/dev/physiotherapist" element={<PhysiotherapistDashboard establishmentType="hospital" />} />
            <Route path="/dev/physiotherapist/hospital" element={<PhysiotherapistDashboard establishmentType="hospital" />} />
            <Route path="/dev/physiotherapist/upa" element={<PhysiotherapistDashboard establishmentType="upa" />} />
            <Route path="/dev/physiotherapist/ubs" element={<PhysiotherapistDashboard establishmentType="ubs" />} />
            
            {/* RH / Gestão de Pessoas Routes */}
            <Route path="/dev/rh" element={<RHDashboardPage />} />
            <Route path="/dev/rh/employees" element={<EmployeesPage />} />
            <Route path="/dev/rh/employees/new" element={<EmployeesPage />} />
            <Route path="/dev/rh/employees/:id" element={<EmployeesPage />} />
            <Route path="/dev/rh/schedules" element={<SchedulesPage />} />
            <Route path="/dev/rh/time-records" element={<TimeRecordsPage />} />
            <Route path="/dev/rh/vacations" element={<VacationsPage />} />
            <Route path="/dev/rh/leaves" element={<VacationsPage />} />
            <Route path="/dev/rh/payroll" element={<PayrollPage />} />
            
            {/* UBS Home Visits Routes */}
            <Route path="/dev/ubs/home-visits" element={<HomeVisitsPage />} />
            <Route path="/dev/ubs/home-visits/new" element={<HomeVisitsPage />} />
            
            {/* UBS Vaccination Routes */}
            <Route path="/dev/ubs/vaccination" element={<VaccinationPage />} />
            
            {/* UBS Health Programs Routes */}
            <Route path="/dev/ubs/health-programs" element={<HealthProgramsPage />} />
            <Route path="/dev/ubs/hiperdia" element={<HealthProgramsPage />} />
            <Route path="/dev/ubs/prenatal" element={<HealthProgramsPage />} />
            <Route path="/dev/ubs/childcare" element={<HealthProgramsPage />} />
            <Route path="/dev/ubs/elderly" element={<HealthProgramsPage />} />
            
            {/* UBS Dental Routes */}
            <Route path="/dev/ubs/dental" element={<DentalPage />} />
            
            {/* Surgery Center Routes */}
            <Route path="/dev/surgery" element={<SurgeryCenterPage />} />
            <Route path="/dev/hospital/surgery" element={<SurgeryCenterPage />} />
            
            {/* Imaging Center Routes */}
            <Route path="/dev/imaging" element={<ImagingCenterPage />} />
            <Route path="/dev/hospital/imaging" element={<ImagingCenterPage />} />
            
            {/* Hospital Emergency (Pronto Socorro) Routes */}
            <Route path="/dev/hospital/emergency" element={<EmergencyPage />} />
            <Route path="/dev/emergency" element={<EmergencyPage />} />
            
            {/* Hospital ICU (UTI) Routes */}
            <Route path="/dev/hospital/icu" element={<ICUPage />} />
            <Route path="/dev/icu" element={<ICUPage />} />
            
            {/* Hospital Lab Routes */}
            <Route path="/dev/hospital/lab" element={<LabPage />} />
            <Route path="/dev/lab" element={<LabPage />} />
            
            {/* Hospital Discharge Routes */}
            <Route path="/dev/hospital/discharge" element={<DischargePage />} />
            <Route path="/dev/discharge" element={<DischargePage />} />
            
            {/* Pharmacy Stock Routes */}
            <Route path="/dev/pharmacy-stock" element={<PharmacyStockPage />} />
            <Route path="/dev/pharmacy/stock" element={<PharmacyStockPage />} />
            
            {/* UPA Medication Room Routes */}
            <Route path="/dev/upa/medication-room" element={<MedicationRoomPage />} />
            <Route path="/dev/medication-room" element={<MedicationRoomPage />} />
            
            {/* UPA Minor Surgery Routes */}
            <Route path="/dev/upa/minor-surgery" element={<MinorSurgeryPage />} />
            <Route path="/dev/minor-surgery" element={<MinorSurgeryPage />} />
            
            {/* Manager Routes - Dev mode without authentication */}
            <Route path="/dev/gestor-geral" element={
              <AdminManagerLayout managerType="geral">
                <GestorGeralDashboard />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-geral/establishments" element={
              <AdminManagerLayout managerType="geral">
                <GeralEstablishmentsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-geral/users" element={
              <AdminManagerLayout managerType="geral">
                <GeralUsersPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-geral/reports" element={
              <AdminManagerLayout managerType="geral">
                <GeralReportsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-geral/settings" element={
              <AdminManagerLayout managerType="geral">
                <GeralSettingsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local" element={
              <AdminManagerLayout managerType="local">
                <GestorLocalDashboard />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local/staff" element={
              <AdminManagerLayout managerType="local">
                <LocalStaffPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local/operations" element={
              <AdminManagerLayout managerType="local">
                <LocalOperationsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local/reports" element={
              <AdminManagerLayout managerType="local">
                <LocalReportsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local/patients" element={
              <AdminManagerLayout managerType="local">
                <LocalPatientsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-local/schedule" element={
              <AdminManagerLayout managerType="local">
                <LocalSchedulePage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-total" element={
              <AdminManagerLayout managerType="total">
                <GestorTotalDashboard />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-total/analytics" element={
              <AdminManagerLayout managerType="total">
                <TotalAnalyticsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-total/regions" element={
              <AdminManagerLayout managerType="total">
                <TotalRegionsPage />
              </AdminManagerLayout>
            } />
            <Route path="/dev/gestor-total/strategic" element={
              <AdminManagerLayout managerType="total">
                <TotalStrategicPage />
              </AdminManagerLayout>
            } />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Medical Dashboard Routes */}
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute requiredPermissions={['medico:read', 'hospital:access']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upa/dashboard"
              element={
                <ProtectedRoute requiredPermissions={['medico:read', 'upa:access']}>
                  <UPADashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubs/dashboard"
              element={
                <ProtectedRoute requiredPermissions={['medico:read', 'ubs:access']}>
                  <UBSDashboard />
                </ProtectedRoute>
              }
            />

            {/* Coordinator Dashboard Routes */}
            <Route
              path="/coordinator/ubs"
              element={
                <ProtectedRoute requiredPermissions={['gestor_geral:read']}>
                  <CoordinatorDashboard establishmentType="UBS" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/upa"
              element={
                <ProtectedRoute requiredPermissions={['gestor_geral:read']}>
                  <CoordinatorDashboard establishmentType="UPA" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/hospital"
              element={
                <ProtectedRoute requiredPermissions={['gestor_geral:read']}>
                  <CoordinatorDashboard establishmentType="HOSPITAL" />
                </ProtectedRoute>
              }
            />

            {/* Prontuario Eletronico Routes */}
            <Route
              path="/prontuario/:patientId"
              element={
                <ProtectedRoute requiredPermissions={['medico:read']}>
                  <ProntuarioPage />
                </ProtectedRoute>
              }
            />

            {/* Psychology Dashboard Routes */}
            <Route
              path="/hospital/psychology"
              element={
                <ProtectedRoute requiredPermissions={['psicologo:read', 'hospital:access']}>
                  <PsychologyDashboard establishmentType="hospital" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upa/psychology"
              element={
                <ProtectedRoute requiredPermissions={['psicologo:read', 'upa:access']}>
                  <PsychologyDashboard establishmentType="upa" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubs/psychology"
              element={
                <ProtectedRoute requiredPermissions={['psicologo:read', 'ubs:access']}>
                  <PsychologyDashboard establishmentType="ubs" />
                </ProtectedRoute>
              }
            />
            
            {/* Physiotherapist Dashboard Routes */}
            <Route
              path="/hospital/physiotherapist"
              element={
                <ProtectedRoute requiredPermissions={['fisioterapeuta:read', 'hospital:access']}>
                  <PhysiotherapistDashboard establishmentType="hospital" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upa/physiotherapist"
              element={
                <ProtectedRoute requiredPermissions={['fisioterapeuta:read', 'upa:access']}>
                  <PhysiotherapistDashboard establishmentType="upa" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubs/physiotherapist"
              element={
                <ProtectedRoute requiredPermissions={['fisioterapeuta:read', 'ubs:access']}>
                  <PhysiotherapistDashboard establishmentType="ubs" />
                </ProtectedRoute>
              }
            />
            
            {/* Pharmacy Dashboard Routes */}
            <Route
              path="/hospital/pharmacy"
              element={
                <ProtectedRoute requiredPermissions={['farmaceutico:read', 'hospital:access']}>
                  <PharmacyDashboard establishmentType="hospital" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upa/pharmacy"
              element={
                <ProtectedRoute requiredPermissions={['farmaceutico:read', 'upa:access']}>
                  <PharmacyDashboard establishmentType="upa" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubs/pharmacy"
              element={
                <ProtectedRoute requiredPermissions={['farmaceutico:read', 'ubs:access']}>
                  <PharmacyDashboard establishmentType="ubs" />
                </ProtectedRoute>
              }
            />
            
            {/* Test Route - Remove in production */}
            <Route
              path="/test-medical-dashboard"
              element={<TestMedicalDashboard />}
            />
            
            {/* Redirect to dev routes by default (no auth required) */}
            <Route path="/" element={<DevRoutesPage />} />
            <Route path="*" element={<DevRoutesPage />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
