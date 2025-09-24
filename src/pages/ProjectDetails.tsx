import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Heart, TrendingUp, ArrowLeft, Eye, CheckCircle, Clock, AlertTriangle, Camera, Brain, User } from 'lucide-react';
import { Project, Expenditure } from '../types';
import { api, getProjectReviews, addProjectReview } from '../services/api';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';
import TripleLockStatus from '../components/TripleLock/TripleLockStatus';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenditures' | 'transparency'>('overview');
  const [reviews, setReviews] = useState<{ id: string; userName: string; rating: number; comment: string; createdAt: Date }[]>([]);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);

  const { user } = useAuth();
  const { connected, sendTransaction } = useWeb3();
  useEffect(() => {
    // update raised amount live on donation events
    const { onDonationEvent } = require('../services/events');
    const off = onDonationEvent(({ projectId, amount }: { projectId: string; amount: number }) => {
      if (projectId === id) {
        setProject(prev => prev ? { ...prev, raisedAmount: prev.raisedAmount + amount } : prev);
      }
    });
    return off;
  }, [id]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;

      try {
        const [projectData, expendituresData, reviewsData] = await Promise.all([
          api.getProject(id),
          api.getExpenditures(id),
          getProjectReviews(id)
        ]);

        setProject(projectData);
        setExpenditures(expendituresData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const handleDonate = async () => {
    if (!user) {
      toast.error('Please login to make a donation');
      return;
    }

    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const remaining = project ? project.targetAmount - project.raisedAmount : 0;
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    if (parseFloat(donationAmount) > remaining) {
      toast.error(`You can donate up to ₹${remaining.toLocaleString()} for this project`);
      return;
    }

    setDonating(true);

    try {
      const txHash = await sendTransaction('0x742d35Cc6634C0532925a3b8D4C9db96DfbF3b87', donationAmount);
      await api.createTransaction(id!, parseFloat(donationAmount));

      toast.success('Donation successful! Transaction recorded on blockchain.');

      if (project) {
        setProject(prev => prev ? {
          ...prev,
          raisedAmount: prev.raisedAmount + parseFloat(donationAmount)
        } : null);
      }

      setDonationAmount('');

    } catch (error) {
      console.error('Donation failed:', error);
      toast.error('Donation failed. Please try again.');
    } finally {
      setDonating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalSpent = expenditures
    .filter(exp => exp.status === 'completed')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const pendingAmount = expenditures
    .filter(exp => exp.status !== 'completed' && exp.status !== 'rejected')
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Link to="/projects" className="text-blue-600 hover:text-blue-700">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/projects" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location.address}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {project.beneficiaryCount} beneficiaries
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Ends {project.endDate.toLocaleDateString()}
                </div>
              </div>
            </div>

            {user && user.role === 'donor' && (
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
                  <h3 className="font-semibold text-gray-900 mb-3">Make a Donation</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      max={(project.targetAmount - project.raisedAmount).toString()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">Remaining you can donate: ₹{Math.max(project.targetAmount - project.raisedAmount, 0).toLocaleString()}</p>
                    <button
                      onClick={handleDonate}
                      disabled={donating || !connected || project.raisedAmount >= project.targetAmount}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {donating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" />
                          <span>Donate Now</span>
                        </>
                      )}
                    </button>
                    {!connected && (
                      <p className="text-xs text-red-600 text-center">Connect your wallet to donate</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Total Raised card always visible */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-[260px]">
                <h3 className="font-semibold text-gray-900 mb-2">Total Donations</h3>
                <div className="text-2xl font-bold text-blue-600">₹{project.raisedAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'expenditures', label: 'All Expenditures', icon: TrendingUp },
              { id: 'transparency', label: 'Transparency Report', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Project Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Progress and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Raised</span>
                    <span className="font-medium">₹{project.raisedAmount.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((project.raisedAmount / project.targetAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target: ₹{project.targetAmount.toLocaleString()}</span>
                    <span className="font-medium text-blue-600">
                      {Math.round((project.raisedAmount / project.targetAmount) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Utilization</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium text-green-600">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">₹{pendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-blue-600">
                      ₹{(project.raisedAmount - totalSpent - pendingAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Beneficiaries</span>
                    <span className="font-medium">{project.beneficiaryCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transactions</span>
                    <span className="font-medium">{expenditures.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transparency</span>
                    <span className="font-medium text-green-600">
                      {Math.round((expenditures.filter(e => e.status === 'completed').length / Math.max(expenditures.length, 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Expenditures Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Expenditures</h3>
                  <button
                    onClick={() => setActiveTab('expenditures')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {expenditures.slice(0, 3).map((expenditure) => (
                  <div key={expenditure.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expenditure.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Amount: ₹{expenditure.amount.toLocaleString()} • {expenditure.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(expenditure.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expenditure.status)}`}>
                          {expenditure.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings & Reviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`h-4 w-4 ${(reviews.reduce((a, r) => a + r.rating, 0) / Math.max(reviews.length, 1)) >= n ? 'fill-current' : ''}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">({reviews.length})</span>
                </div>
              </div>

              {user && (user.role === 'donor' || user.role === 'beneficiary') && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setNewRating(n)}>
                        <Star className={`h-5 w-5 ${newRating >= n ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={async () => {
                        if (!newRating) { toast.error('Please select a rating'); return; }
                        const review = await addProjectReview(id!, user.id, user.name, newRating, newComment);
                        setReviews(prev => [review, ...prev]);
                        setNewRating(0);
                        setNewComment('');
                        toast.success('Review submitted');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 text-sm">{r.userName}</div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`h-3 w-3 ${r.rating >= n ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{r.comment}</div>
                    <div className="text-xs text-gray-400 mt-1">{r.createdAt.toLocaleString()}</div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-sm text-gray-500">No reviews yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenditures Tab */}
        {activeTab === 'expenditures' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Project Expenditures</h2>
              <p className="text-gray-600 mb-6">
                Complete transparency: Every rupee spent is tracked through our Triple-Lock verification system.
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">₹{totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Total Spent</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</div>
                  <div className="text-sm text-yellow-700">Pending Approval</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{expenditures.length}</div>
                  <div className="text-sm text-blue-700">Total Transactions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {expenditures.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-purple-700">Verified</div>
                </div>
              </div>

              {/* Expenditures List */}
              <div className="space-y-6">
                {expenditures.map((expenditure) => (
                  <div key={expenditure.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{expenditure.description}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Amount: ₹{expenditure.amount.toLocaleString()}</span>
                          <span>Category: {expenditure.category}</span>
                          <span>Date: {expenditure.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(expenditure.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(expenditure.status)}`}>
                          {expenditure.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Triple-Lock Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Triple-Lock Verification Status</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Vendor Proof */}
                        <div className={`p-3 rounded-lg border-2 ${expenditure.vendorProof ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Camera className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Vendor Proof</span>
                            {expenditure.vendorProof ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {expenditure.vendorProof ? (
                            <div className="text-xs text-gray-600">
                              <div>✓ Photos submitted</div>
                              <div>✓ Location verified</div>
                              <div>✓ Timestamp confirmed</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Awaiting vendor submission</div>
                          )}
                        </div>

                        {/* AI Verification */}
                        <div className={`p-3 rounded-lg border-2 ${expenditure.aiVerification ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">AI Verification</span>
                            {expenditure.aiVerification ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {expenditure.aiVerification ? (
                            <div className="text-xs text-gray-600">
                              <div>✓ Document verified</div>
                              <div>✓ OCR completed</div>
                              <div>✓ Authenticity: {Math.round((expenditure.aiVerification.authenticity || 0) * 100)}%</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Awaiting AI analysis</div>
                          )}
                        </div>

                        {/* Beneficiary Approval */}
                        <div className={`p-3 rounded-lg border-2 ${expenditure.beneficiaryApproval ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Beneficiary Consent</span>
                            {expenditure.beneficiaryApproval ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {expenditure.beneficiaryApproval ? (
                            <div className="text-xs text-gray-600">
                              <div>✓ Receipt confirmed</div>
                              <div>✓ Feedback provided</div>
                              {expenditure.beneficiaryApproval.feedback && (
                                <div className="mt-1 italic">"{expenditure.beneficiaryApproval.feedback}"</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Awaiting beneficiary confirmation</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {expenditures.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Expenditures Yet</h3>
                  <p className="text-gray-600">
                    Expenditures will appear here once the NGO starts using the raised funds.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transparency Report Tab */}
        {activeTab === 'transparency' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transparency Report</h2>
              <p className="text-gray-600 mb-6">
                This report provides complete transparency into how funds are being utilized for this project.
              </p>

              {/* Transparency Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round((expenditures.filter(e => e.status === 'completed').length / Math.max(expenditures.length, 1)) * 100)}%
                  </div>
                  <div className="text-lg font-medium text-gray-900 mb-2">Transparency Score</div>
                  <div className="text-sm text-gray-600">
                    Based on verified transactions through Triple-Lock system
                  </div>
                </div>
              </div>

              {/* Fund Flow Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Inflow</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Donations Received</span>
                      <span className="font-medium">₹{project.raisedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Number of Donors</span>
                      <span className="font-medium">Multiple</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Average Donation</span>
                      <span className="font-medium">₹{Math.round(project.raisedAmount / 10).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Utilization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Funds Utilized</span>
                      <span className="font-medium text-green-600">₹{totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Pending Approvals</span>
                      <span className="font-medium text-yellow-600">₹{pendingAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-medium text-blue-600">
                        ₹{(project.raisedAmount - totalSpent - pendingAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Statistics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {expenditures.filter(e => e.vendorProof).length}
                    </div>
                    <div className="text-sm text-gray-600">Vendor Proofs Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {expenditures.filter(e => e.aiVerification).length}
                    </div>
                    <div className="text-sm text-gray-600">AI Verifications Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {expenditures.filter(e => e.beneficiaryApproval).length}
                    </div>
                    <div className="text-sm text-gray-600">Beneficiary Approvals</div>
                  </div>
                </div>
              </div>

              {/* Public Commitment */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Our Transparency Commitment</h3>
                <p className="text-blue-800 text-sm">
                  Every transaction in this project is verified through our Triple-Lock system and recorded on the blockchain.
                  This ensures complete transparency and accountability. All stakeholders - donors, beneficiaries, and the
                  general public - can verify how funds are being utilized in real-time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;