import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Insights Pop-up
  const [showInsightsPopup, setShowInsightsPopup] = useState(false);
  const [currentInsights, setCurrentInsights] = useState({ supplierId: null, insights: '' });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  // States for Compliance Records Pop-up
  const [showRecordsPopup, setShowRecordsPopup] = useState(false);
  const [currentRecords, setCurrentRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);
  const [currentRecordsSupplierId, setCurrentRecordsSupplierId] = useState(null);


  // Effect to fetch the list of suppliers when the component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/suppliers'); // Your API endpoint
        setSuppliers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch suppliers. Please try again later.');
        setLoading(false);
        console.error('Error fetching suppliers:', err);
      }
    };

    fetchSuppliers();
  }, []); // The empty dependency array ensures this runs only once, on component mount

  // Function to handle fetching insights for a specific supplier
  const handleGetInsights = async (supplierId) => {
    setInsightsLoading(true); // Start loading for insights
    setInsightsError(null);   // Clear previous insights errors
    setCurrentInsights({ supplierId: supplierId, insights: '' }); // Clear previous insights
    setShowInsightsPopup(true); // Show the popup immediately, even if loading

    try {
      const response = await axios.get(`http://localhost:8000/suppliers/insights/${supplierId}`);
      setCurrentInsights({ supplierId: supplierId, insights: response.data.insights });
    } catch (err) {
      console.error(`Error fetching insights for supplier ${supplierId}:`, err);
      setInsightsError(`Failed to fetch insights for this supplier: ${err.response?.data?.detail || err.message}`);
    } finally {
      setInsightsLoading(false); // End loading for insights
    }
  };

  // Function to close the insights popup
  const closeInsightsPopup = () => {
    setShowInsightsPopup(false);
    setCurrentInsights({ supplierId: null, insights: '' }); // Clear insights on close
    setInsightsError(null); // Clear any errors
  };

  // Function to handle fetching compliance records for a specific supplier
  const handleViewRecords = async (supplierId) => {
    setRecordsLoading(true); // Start loading for records
    setRecordsError(null);   // Clear previous records errors
    setCurrentRecords([]); // Clear previous records
    setCurrentRecordsSupplierId(supplierId); // Set the supplier ID for the records popup
    setShowRecordsPopup(true); // Show the popup immediately, even if loading

    try {
      const response = await axios.get(`http://localhost:8000/compliance_records/${supplierId}`);
      setCurrentRecords(response.data);
    } catch (err) {
      console.error(`Error fetching compliance records for supplier ${supplierId}:`, err);
      setRecordsError(`Failed to fetch compliance records: ${err.response?.data?.detail || err.message}`);
    } finally {
      setRecordsLoading(false); // End loading for records
    }
  };

  // Function to close the compliance records popup
  const closeRecordsPopup = () => {
    setShowRecordsPopup(false);
    setCurrentRecords([]); // Clear records on close
    setRecordsError(null); // Clear any errors
    setCurrentRecordsSupplierId(null);
  };


  if (loading) {
    return (
      <div className="text-center p-5 text-gray-400 bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading suppliers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-5 border border-red-700 bg-red-900 bg-opacity-30 rounded-md mx-auto max-w-lg mt-10">
        Error: {error}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center p-5 text-gray-400 bg-gray-800 rounded-lg mx-auto max-w-4xl my-8">
        No suppliers found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-gray-800 rounded-lg shadow-xl text-gray-100">
      <h2 className="text-4xl font-extrabold mb-8 text-indigo-400 text-center">Our Suppliers</h2>
      <ul className="list-none p-0 space-y-6">
        {suppliers.map((supplier) => (
          <li
            key={supplier.id}
            className="p-6 border border-gray-700 rounded-lg bg-gray-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex-grow space-y-2">
              <h3 className="text-2xl font-semibold text-emerald-400">{supplier.name}</h3>
              <p className="text-gray-300"><strong className="font-medium text-gray-200">Country:</strong> {supplier.country}</p>
              <p className="text-gray-300"><strong className="font-medium text-gray-200">Compliance Score:</strong> <span className="font-bold text-yellow-300">{supplier.compliance_score}</span></p>
              <p className="text-gray-300"><strong className="font-medium text-gray-200">Last Audit:</strong> {supplier.last_audit ? new Date(supplier.last_audit).toLocaleDateString() : 'N/A'}</p>

              {Object.keys(supplier.contract_terms).length > 0 && (
                <div className="mt-4 border-t border-gray-600 pt-4">
                  <p className="text-gray-300 font-medium mb-2 text-lg">Contract Terms:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    {Object.entries(supplier.contract_terms).map(([key, value]) => (
                      <li key={key}>
                        <strong className="capitalize text-gray-300">{key.replace(/_/g, ' ')}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.keys(supplier.contract_terms).length === 0 && (
                <p className="text-gray-400 mt-4"><strong className="font-medium">Contract Terms:</strong> No specific terms listed.</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-0">
              <button
                onClick={() => handleGetInsights(supplier.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 min-w-[140px]"
              >
                Get Insights
              </button>
              <button
                onClick={() => handleViewRecords(supplier.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-700 min-w-[140px]"
              >
                View Records
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Insights Pop-up/Modal */}
      {showInsightsPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700">
            <h3 className="text-3xl font-bold mb-4 text-indigo-400 border-b border-gray-700 pb-3">
              Insights for Supplier ID: <span className="text-emerald-400">{currentInsights.supplierId}</span>
            </h3>

            {insightsLoading && (
              <div className="text-blue-400 p-4 bg-blue-900 bg-opacity-30 rounded-md animate-pulse">
                Generating insights... This may take a moment.
              </div>
            )}

            {insightsError && (
              <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
                Error: {insightsError}
              </div>
            )}

            {!insightsLoading && !insightsError && currentInsights.insights && (
              <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed space-y-4">
                <ReactMarkdown>{currentInsights.insights}</ReactMarkdown>
              </div>
            )}
            {!insightsLoading && !insightsError && !currentInsights.insights && (
                <div className="text-gray-400 p-4 bg-gray-700 rounded-md">
                    No insights available for this supplier yet.
                </div>
            )}

            <button
              onClick={closeInsightsPopup}
              className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-full leading-none text-xl font-bold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Close insights"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Compliance Records Pop-up/Modal */}
      {showRecordsPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative border border-gray-700">
            <h3 className="text-3xl font-bold mb-4 text-indigo-400 border-b border-gray-700 pb-3">
              Compliance Records for Supplier ID: <span className="text-emerald-400">{currentRecordsSupplierId}</span>
            </h3>

            {recordsLoading && (
              <div className="text-blue-400 p-4 bg-blue-900 bg-opacity-30 rounded-md animate-pulse">
                Loading compliance records...
              </div>
            )}

            {recordsError && (
              <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
                Error: {recordsError}
              </div>
            )}

            {!recordsLoading && !recordsError && (
              <>
                {currentRecords.length > 0 ? (
                  <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
                    <table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg overflow-hidden">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Metric</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Result</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {currentRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{record.date_recorded}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{record.metric}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{record.result}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'compliant' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-gray-400 bg-gray-700 rounded-md">
                    No compliance records found for this supplier.
                  </div>
                )}
              </>
            )}

            <button
              onClick={closeRecordsPopup}
              className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-full leading-none text-xl font-bold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Close records"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierList;