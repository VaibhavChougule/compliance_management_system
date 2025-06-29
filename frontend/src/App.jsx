import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SupplierForm from './components/SupplierForm.jsx';
import SupplierList from './components/SupplierList.jsx';
import ViewSupplierDetails from './components/ViewSupplierDetails.jsx';
import ComplianceFormWrapper from './components/ComplianceFormWrapper.jsx';
import './App.css'; // Keep this for any global styles or base font

function Home() {
  const [supplierId, setSupplierId] = useState('');
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (supplierId) {
      navigate(`/check-complience/${supplierId}`);
    } else {
      alert('Please enter a valid Supplier ID');
    }
  };

  return (
    <div className="home-buttons bg-gray-800 p-8 rounded-lg shadow-xl text-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Navigate to:</h2>
      <div className="flex flex-col gap-5 items-start">
        <Link to="/add" className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
          Add Supplier
        </Link>
        <Link to="/list" className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
          Supplier List
        </Link>
        <Link to="/supplier" className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
          View Supplier Details
        </Link>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full">
          <input
            type="number"
            placeholder="Enter Supplier ID"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="flex-grow p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button onClick={handleNavigate} className="btn bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 min-w-max">
            Upload Compliance Data
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Supplier Compliance Monitor
        </h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<SupplierForm />} />
          <Route path="/list" element={<SupplierList />} />
          <Route path="/supplier" element={<ViewSupplierDetails />} />
          <Route path="/check-complience/:id" element={<ComplianceFormWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;