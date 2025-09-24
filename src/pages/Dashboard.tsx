import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DonorDashboard from '../components/Dashboard/DonorDashboard';
import NGODashboard from '../components/Dashboard/NGODashboard';
import { Shield, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'donor':
        return <DonorDashboard />;
      case 'ngo':
      case 'government':
        return <NGODashboard />;
      case 'beneficiary':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Beneficiary Dashboard</h2>
            <p className="text-gray-600">
              Your beneficiary dashboard is coming soon. You'll be able to track services 
              received and provide feedback on project implementations.
            </p>
          </div>
        );
      case 'vendor':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendor Dashboard</h2>
            <p className="text-gray-600">
              Your vendor dashboard is coming soon. You'll be able to submit proof of delivery, 
              track payments, and manage your service contracts.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Not Available</h2>
            <p className="text-gray-600">
              Dashboard for your role is not yet implemented.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;