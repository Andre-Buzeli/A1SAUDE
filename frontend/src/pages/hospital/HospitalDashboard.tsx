import React from 'react';
import { MedicalDashboard } from '../../components/medical/MedicalDashboard';

export const HospitalDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <MedicalDashboard establishmentType="hospital" />
    </div>
  );
};