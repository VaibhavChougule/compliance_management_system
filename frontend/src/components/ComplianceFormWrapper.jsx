import React from 'react';
import { useParams } from 'react-router-dom';
import ComplianceForm from './ComplianceForm.jsx';

function ComplianceFormWrapper() {
  const { id } = useParams();
  return <ComplianceForm supplierId={parseInt(id, 10)} />;
}

export default ComplianceFormWrapper;
