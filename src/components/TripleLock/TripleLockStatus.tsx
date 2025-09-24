import React from 'react';
import { CheckCircle, Clock, AlertCircle, Camera, Brain, Users } from 'lucide-react';
import { Expenditure } from '../../types';

interface TripleLockStatusProps {
  expenditure: Expenditure;
}

const TripleLockStatus: React.FC<TripleLockStatusProps> = ({ expenditure }) => {
  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (status === 'pending') return <Clock className="h-6 w-6 text-yellow-500" />;
    return <AlertCircle className="h-6 w-6 text-gray-400" />;
  };

  const getStatusColor = (status: string, completed: boolean) => {
    if (completed) return 'border-green-500 bg-green-50';
    if (status === 'pending') return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-300 bg-gray-50';
  };

  const vendorCompleted = expenditure.vendorProof !== undefined;
  const aiCompleted = expenditure.aiVerification !== undefined;
  const beneficiaryCompleted = expenditure.beneficiaryApproval !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Triple-Lock Verification Status</h3>
      
      <div className="space-y-6">
        {/* Lock 1: Vendor Proof */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor('vendor', vendorCompleted)}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Camera className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Lock 1: Vendor Proof</span>
            {getStatusIcon('vendor', vendorCompleted)}
          </div>
          
          {vendorCompleted ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ✓ Geo-tagged photos submitted
              </p>
              <p className="text-sm text-gray-600">
                ✓ Timestamp verified: {expenditure.vendorProof?.timestamp.toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                ✓ Location: {expenditure.vendorProof?.location.join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Waiting for vendor to submit proof of delivery/completion
            </p>
          )}
        </div>

        {/* Lock 2: AI Verification */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor('ai', aiCompleted)}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900">Lock 2: AI Verification</span>
            {getStatusIcon('ai', aiCompleted)}
          </div>
          
          {aiCompleted ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ✓ Document authenticity: {Math.round((expenditure.aiVerification?.authenticity || 0) * 100)}%
              </p>
              <p className="text-sm text-gray-600">
                ✓ OCR verification completed
              </p>
              {expenditure.aiVerification?.anomalies.length === 0 ? (
                <p className="text-sm text-gray-600">✓ No anomalies detected</p>
              ) : (
                <p className="text-sm text-yellow-600">
                  ⚠ {expenditure.aiVerification?.anomalies.length} anomalies detected
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {vendorCompleted ? 'AI analysis in progress...' : 'Waiting for vendor proof'}
            </p>
          )}
        </div>

        {/* Lock 3: Beneficiary Approval */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor('beneficiary', beneficiaryCompleted)}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Lock 3: Beneficiary Consent</span>
            {getStatusIcon('beneficiary', beneficiaryCompleted)}
          </div>
          
          {beneficiaryCompleted ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ✓ Beneficiary confirmed receipt
              </p>
              <p className="text-sm text-gray-600">
                ✓ Approval date: {expenditure.beneficiaryApproval?.timestamp.toLocaleDateString()}
              </p>
              {expenditure.beneficiaryApproval?.feedback && (
                <p className="text-sm text-gray-600 italic">
                  "{expenditure.beneficiaryApproval.feedback}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {aiCompleted ? 'Awaiting beneficiary confirmation' : 'Waiting for AI verification'}
            </p>
          )}
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Overall Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            expenditure.status === 'completed' 
              ? 'bg-green-100 text-green-800'
              : expenditure.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {expenditure.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripleLockStatus;