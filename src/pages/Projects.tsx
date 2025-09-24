import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Heart, TrendingUp, Filter } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [donationAmount, setDonationAmount] = useState<{ [key: string]: string }>({});
  const [donatingTo, setDonatingTo] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { connected, sendTransaction } = useWeb3();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const categories = ['all', 'Education', 'Water & Sanitation', 'Healthcare', 'Environment'];
  
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const handleDonate = async (projectId: string) => {
    if (!user) {
      toast.error('Please login to make a donation');
      return;
    }

    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = donationAmount[projectId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setDonatingTo(projectId);
    
    try {
      // Simulate blockchain transaction
      const txHash = await sendTransaction('0x742d35Cc6634C0532925a3b8D4C9db96DfbF3b87', amount);
      
      // Create transaction record
      await api.createTransaction(projectId, parseFloat(amount));
      
      toast.success('Donation successful! Transaction recorded on blockchain.');
      
      // Update project raised amount locally
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, raisedAmount: project.raisedAmount + parseFloat(amount) }
          : project
      ));
      
      // Clear donation amount
      setDonationAmount(prev => ({ ...prev, [projectId]: '' }));
      
    } catch (error) {
      console.error('Donation failed:', error);
      toast.error('Donation failed. Please try again.');
    } finally {
      setDonatingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Projects</h1>
          <p className="text-gray-600">
            Support transparent projects and track your impact in real-time
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={project.images[0]} 
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.location.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {project.beneficiaryCount} beneficiaries
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ends {project.endDate.toLocaleDateString()}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {Math.round((project.raisedAmount / project.targetAmount) * 100)}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(project.raisedAmount / project.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ₹{project.raisedAmount.toLocaleString()} raised
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{project.targetAmount.toLocaleString()} goal
                    </span>
                  </div>
                </div>

                {/* Donation Section */}
                {user && user.role === 'donor' && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={donationAmount[project.id] || ''}
                        onChange={(e) => setDonationAmount(prev => ({
                          ...prev,
                          [project.id]: e.target.value
                        }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleDonate(project.id)}
                        disabled={donatingTo === project.id || !connected}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {donatingTo === project.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Heart className="h-4 w-4" />
                            <span>Donate</span>
                          </>
                        )}
                      </button>
                    </div>
                    {!connected && (
                      <p className="text-xs text-red-600 mt-1">Connect your wallet to donate</p>
                    )}
                  </div>
                )}

                {/* View Details Button for non-donors */}
                {(!user || user.role !== 'donor') && (
                  <Link 
                    to={`/projects/${project.id}`}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No projects are currently available.' 
                : `No projects found in the ${selectedCategory} category.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;