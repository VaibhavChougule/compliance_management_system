import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function ComplianceForm({ supplierId }) {
  const [metrics, setMetrics] = useState([{ metric: '', result: '', status: 'compliant' }]);
  const [complianceDate, setComplianceDate] = useState('');
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddMetric = () => {
    setMetrics([...metrics, { metric: '', result: '', status: 'compliant' }]);
  };

  const handleMetricChange = (index, field, value) => {
    const newMetrics = [...metrics];
    newMetrics[index][field] = value;
    setMetrics(newMetrics);
  };

  const handleDateChange = (e) => {
    setComplianceDate(e.target.value);
  };

  const handleRemoveMetric = (index) => {
    const newMetrics = metrics.filter((_, i) => i !== index);
    setMetrics(newMetrics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiResponse(null);

    const isValidMetrics = metrics.every(m => m.metric.trim() !== '' && m.result.trim() !== '');
    const isValidDate = complianceDate.trim() !== '';

    if (!isValidMetrics || !isValidDate) {
      setError('Please fill in all metric, result fields, and select a compliance date.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        supplier_id: supplierId,
        compliance_date: complianceDate,
        metrics: metrics.map(m => ({
          metric: m.metric.trim(),
          result: m.result.trim(),
          status: m.status
        }))
      };

      const response = await axios.post('http://localhost:8000/suppliers/check-compliance', payload);
      setApiResponse(response.data);

      if (response.data.alerts && response.data.alerts.length > 0) {
        setError(response.data.alerts.join('\n'));
      } else {
        setError(null);
      }

      setMetrics([{ metric: '', result: '', status: 'compliant' }]);
      setComplianceDate('');
      alert('Compliance data submitted successfully!'); // Provide user feedback
    } catch (err) {
      console.error('Error submitting compliance data:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Submission failed: ${err.response.data.message}`);
      } else {
        setError('An unexpected error occurred during submission. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-lg shadow-xl text-gray-100 my-8">
      <h3 className="mb-6 text-3xl font-bold text-indigo-400 text-center">
        Upload Compliance Data for Supplier ID: {supplierId}
      </h3>

      {error && (
        <div className="text-red-400 mb-4 p-3 border border-red-700 bg-red-900 bg-opacity-30 rounded-md whitespace-pre-wrap">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="text-blue-400 mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-md animate-pulse">
          Submitting compliance data...
        </div>
      )}

      {apiResponse && (
        <div className="mb-4 p-4 border border-emerald-700 bg-emerald-900 bg-opacity-30 rounded-md">
          <h4 className="text-lg font-semibold text-emerald-400 mb-2">API Response:</h4>
          <div className="prose prose-invert text-gray-200">
            <ReactMarkdown>{apiResponse.response}</ReactMarkdown>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Compliance Date Field */}
        <div className="space-y-2">
          <label htmlFor="complianceDate" className="block text-lg font-medium text-gray-300">
            Compliance Date:
          </label>
          <input
            type="date"
            id="complianceDate"
            value={complianceDate}
            onChange={handleDateChange}
            className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        {/* Metric Input Fields */}
        <div className="space-y-4">
          <p className="block text-lg font-medium text-gray-300 mb-2">Compliance Metrics:</p>
          {metrics.map((metric, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center p-4 bg-gray-700 rounded-lg shadow-sm">
              {/* Metric Selector */}
              <select
                value={metric.metric}
                onChange={(e) => handleMetricChange(index, 'metric', e.target.value)}
                className="col-span-full sm:col-span-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Metric</option>
                <option value="Delivery Time">Delivery Time</option>
                <option value="Quality">Quality</option>
              </select>

              {/* Result Input */}
              <input
                type="text"
                placeholder="Metric Result"
                value={metric.result}
                onChange={(e) => handleMetricChange(index, 'result', e.target.value)}
                className="col-span-full sm:col-span-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Status Selector */}
              <select
                value={metric.status}
                onChange={(e) => handleMetricChange(index, 'status', e.target.value)}
                className="col-span-full sm:col-span-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-compliant</option>
              </select>

              {/* Remove Metric Button */}
              {metrics.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMetric(index)}
                  className="col-span-full sm:col-span-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end">
          <button
            type="button"
            onClick={handleAddMetric}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Add Another Metric
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              loading ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Compliance Data'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplianceForm;