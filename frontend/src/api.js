import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/suppliers`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch suppliers');
  }
};

export const getSupplier = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch supplier details');
  }
};

export const createSupplier = async (supplier) => {
  try {
    const response = await axios.post(`${API_URL}/suppliers`, supplier);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create supplier');
  }
};

export const checkCompliance = async (complianceData) => {
  try {
    const response = await axios.post(`${API_URL}/suppliers/check-compliance`, complianceData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to check compliance: ' + error.response?.data?.detail);
  }
};

export const getInsights = async (supplierId) => {
  try {
    const response = await axios.get(`${API_URL}/suppliers/insights?supplier_id=${supplierId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch insights: ' + error.response?.data?.detail);
  }
};

// Add the missing getComplianceRecords function
export const getComplianceRecords = async (supplierId) => {
  try {
    const response = await axios.get(`${API_URL}/suppliers/${supplierId}/records`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch compliance records: ' + error.response?.data?.detail);
  }
};