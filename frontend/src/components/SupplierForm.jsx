import React, { useState } from 'react';
import axios from 'axios';

function SupplierForm() {
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    country: '',
    contract_terms: {}, // Initialize as an empty object to store multiple key-value pairs
    compliance_score: 0,
    last_audit: '',
  });

  // State to manage the temporary key and value for adding a new contract term
  const [newTermKey, setNewTermKey] = useState('');
  const [newTermValue, setNewTermValue] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/suppliers', newSupplier);
      console.log('Supplier created successfully:', response.data);

      // Reset form after successful submission
      setNewSupplier({
        name: '',
        country: '',
        contract_terms: {},
        compliance_score: 0,
        last_audit: '',
      });
      setNewTermKey('');
      setNewTermValue('');
      alert('Supplier added successfully!'); // User feedback
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Error creating supplier. Please try again.'); // User feedback
    }
  };

  const addContractTerm = () => {
    if (newTermKey.trim() && newTermValue.trim()) { // Ensure both key and value are not empty
      setNewSupplier((prevSupplier) => ({
        ...prevSupplier,
        contract_terms: {
          ...prevSupplier.contract_terms, // Crucial: Spread existing contract_terms
          [newTermKey.trim()]: newTermValue.trim(), // Add the new key-value pair
        },
      }));
      setNewTermKey(''); // Clear temporary key
      setNewTermValue(''); // Clear temporary value
    } else {
      alert('Please enter both a key and a value for the contract term.');
    }
  };

  const handleContractTermChange = (key, newValue) => {
    setNewSupplier((prevSupplier) => ({
      ...prevSupplier,
      contract_terms: {
        ...prevSupplier.contract_terms,
        [key]: newValue,
      },
    }));
  };

  const removeContractTerm = (keyToRemove) => {
    setNewSupplier((prevSupplier) => {
      const updatedContractTerms = { ...prevSupplier.contract_terms };
      delete updatedContractTerms[keyToRemove];
      return {
        ...prevSupplier,
        contract_terms: updatedContractTerms,
      };
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 shadow-xl rounded-lg text-gray-100">
      <form onSubmit={handleCreate} className="space-y-6">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">Add New Supplier</h2>

        {/* Supplier Name */}
        <div className="space-y-2">
          <label htmlFor="supplierName" className="block text-lg font-medium text-gray-300">
            Supplier Name:
          </label>
          <input
            id="supplierName"
            type="text"
            placeholder="e.g., GlobalTech Solutions"
            value={newSupplier.name}
            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label htmlFor="country" className="block text-lg font-medium text-gray-300">
            Country:
          </label>
          <input
            id="country"
            type="text"
            placeholder="e.g., USA, India"
            value={newSupplier.country}
            onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dynamic Contract Terms Input */}
        <div className="space-y-4 border border-gray-700 p-4 rounded-lg bg-gray-700">
          <label className="block text-lg font-medium text-sky-400">Contract Terms:</label>

          {Object.entries(newSupplier.contract_terms).length === 0 && (
            <p className="text-sm text-gray-400 italic">No contract terms added yet. Add some below!</p>
          )}

          <div className="space-y-3">
            {Object.entries(newSupplier.contract_terms).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-600 rounded-md shadow-sm">
                <input
                  type="text"
                  value={key}
                  readOnly
                  className="w-full sm:w-32 px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-sm font-medium text-gray-200 cursor-not-allowed"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleContractTermChange(key, e.target.value)}
                  className="flex-1 w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeContractTerm(key)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add New Contract Term */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 border-2 border-dashed border-gray-500 rounded-md bg-gray-700">
            <input
              type="text"
              placeholder="New Key (e.g., Payment Terms)"
              value={newTermKey}
              onChange={(e) => setNewTermKey(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            <input
              type="text"
              placeholder="New Value (e.g., Net 30 days)"
              value={newTermValue}
              onChange={(e) => setNewTermValue(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              onClick={addContractTerm}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors whitespace-nowrap"
            >
              + Add Term
            </button>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="space-y-2">
          <label htmlFor="complianceScore" className="block text-lg font-medium text-gray-300">
            Compliance Score:
          </label>
          <input
            id="complianceScore"
            type="number"
            placeholder="e.g., 85"
            value={newSupplier.compliance_score}
            onChange={(e) => setNewSupplier({ ...newSupplier, compliance_score: parseInt(e.target.value) || 0 })}
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Last Audit Date */}
        <div className="space-y-2">
          <label htmlFor="lastAudit" className="block text-lg font-medium text-gray-300">
            Last Audit Date:
          </label>
          <input
            id="lastAudit"
            type="date"
            value={newSupplier.last_audit}
            onChange={(e) => setNewSupplier({ ...newSupplier, last_audit: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        >
          Add Supplier
        </button>
      </form>
    </div>
  );
}

export default SupplierForm;