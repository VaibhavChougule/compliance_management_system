import React, { useState } from 'react';
import axios from 'axios';

function ViewSupplierDetails() {
  const [supplierId, setSupplierId] = useState('');
  const [supplier, setSupplier] = useState(null);
  const [error, setError] = useState('');

  const fetchSupplier = async () => {
    setSupplier(null); // Reset previous results
    setError('');

    if (!supplierId.trim()) {
      setError('Please enter a valid Supplier ID.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/suppliers/${supplierId}`);
      setSupplier(response.data);
    } catch (err) {
      console.error(err);
      setError('Supplier not found or server error.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-800 rounded-lg shadow-xl text-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">Find Supplier by ID</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="number"
          placeholder="Enter Supplier ID"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="flex-grow p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={fetchSupplier}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 min-w-max"
        >
          Fetch Supplier
        </button>
      </div>

      {error && (
        <p className="text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md mb-4 text-center">
          {error}
        </p>
      )}

      {supplier && (
        <div className="border border-gray-700 bg-gray-700 p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-semibold mb-4 text-emerald-400">Supplier Details</h3>
          <div className="space-y-2 text-lg">
            <p><strong className="text-gray-300">ID:</strong> {supplier.id}</p>
            <p><strong className="text-gray-300">Name:</strong> {supplier.name}</p>
            <p><strong className="text-gray-300">Country:</strong> {supplier.country}</p>
            <p><strong className="text-gray-300">Compliance Score:</strong> <span className="font-bold text-yellow-300">{supplier.compliance_score}</span></p>
            <p><strong className="text-gray-300">Last Audit:</strong> {supplier.last_audit}</p>
          </div>
          
          <h4 className="text-xl font-semibold mt-6 mb-3 text-sky-400">Contract Terms:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4 text-lg">
            {Object.entries(supplier.contract_terms).map(([key, value]) => (
              <li key={key} className="text-gray-200">
                <strong className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ViewSupplierDetails;