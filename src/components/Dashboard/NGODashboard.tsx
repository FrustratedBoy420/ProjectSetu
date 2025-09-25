import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Project, Expenditure, DashboardStats, Vendor, ProjectUpdate } from '../../types';
import { api } from '../../services/api';
import TripleLockStatus from '../TripleLock/TripleLockStatus';
import toast from 'react-hot-toast';
import { onDonationEvent } from '../../services/events';

const NGODashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'expenditures' | 'updates'>('overview');
  const [vendorsByCategory, setVendorsByCategory] = useState<Record<string, Vendor[]>>({});
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState<{ projectId: string; stage: string; percent: number; note: string; transactionsNote: string }>({ projectId: '', stage: '', percent: 0, note: '', transactionsNote: '' });
  const [projectUpdateDrafts, setProjectUpdateDrafts] = useState<Record<string, { stage: string; percent: number; note: string; transactionsNote: string }>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState<{ title: string; description: string; targetAmount: number; category: string; locationAddress: string; imageUrl: string; beneficiaryCount: number }>({ title: '', description: '', targetAmount: 0, category: '', locationAddress: '', imageUrl: '', beneficiaryCount: 0 });
  const [showNewExpenditure, setShowNewExpenditure] = useState(false);
  const [newExpenditure, setNewExpenditure] = useState<{ projectId: string; category: string; vendorId: string; amount: number; description: string }>({ projectId: '', category: '', vendorId: '', amount: 0, description: '' });
  const [vendorsForNewExp, setVendorsForNewExp] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Record<string, string>>({});
  const [proofFiles, setProofFiles] = useState<Record<string, File[]>>({});
  const [proofDesc, setProofDesc] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, projectsData, expendituresData, updatesData] = await Promise.all([
          api.getDashboardStats('ngo1', 'ngo'),
          api.getProjects(),
          api.getExpenditures(),
          api.getProjectUpdates()
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setExpenditures(expendituresData);
        setUpdates(updatesData);
        // Preload vendors by category present in expenditures
        const categories = Array.from(new Set(expendituresData.map(e => e.category)));
        const entries = await Promise.all(categories.map(async (cat) => [cat, await api.getVendors(cat)] as [string, Vendor[]]));
        const vendorMap: Record<string, Vendor[]> = {};
        entries.forEach(([cat, list]) => { vendorMap[cat] = list; });
        setVendorsByCategory(vendorMap);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // live update project funding on donations
    const off = onDonationEvent(({ projectId, amount }) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, raisedAmount: p.raisedAmount + amount } : p));
      setStats(prev => prev ? { ...prev, totalDonations: prev.totalDonations + amount } : prev);
    });
    return off;
  }, []);

  const projectFundingData = projects.map(project => ({
    name: project.title.substring(0, 15) + '...',
    raised: project.raisedAmount,
    target: project.targetAmount
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">NGO Management Dashboard</h1>
        <p className="text-green-100">Manage your projects, track expenditures, and ensure transparency.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Projects' },
            { id: 'expenditures', label: 'Expenditures' },
            { id: 'updates', label: 'Updates' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Funds</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats?.totalDonations.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Beneficiaries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalBeneficiaries.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {expenditures.filter(e => e.status !== 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Funding Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Funding Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectFundingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Bar dataKey="raised" fill="#10B981" name="Raised" />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overview Reports (Dummy) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Total Funds – Report</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li>Funds raised this month: ₹{Math.round((stats?.totalDonations || 0) * 0.08).toLocaleString()}</li>
                <li>Average donation size: ₹{Math.round((stats?.totalDonations || 1) / Math.max(stats?.totalProjects || 1, 1)).toLocaleString()}</li>
                <li>Top category: Education</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Projects – Report</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li>Currently active: {projects.filter(p => p.status === 'active').length}</li>
                <li>Avg. completion: {Math.round(projects.reduce((acc, p) => acc + (p.raisedAmount / p.targetAmount), 0) / Math.max(projects.length, 1) * 100)}%</li>
                <li>New projects this quarter: 2</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Beneficiaries – Report</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li>Total impacted: {stats?.totalBeneficiaries.toLocaleString()}</li>
                <li>Avg. per project: {Math.round((stats?.totalBeneficiaries || 0) / Math.max(stats?.totalProjects || 1, 1)).toLocaleString()}</li>
                <li>Regions covered: 5</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Pending Approvals – Report</h4>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
                <li>Items awaiting verification: {expenditures.filter(e => e.status !== 'completed').length}</li>
                <li>Avg. time to approve: 2.4 days</li>
                <li>With AI anomalies: {expenditures.filter(e => (e.aiVerification?.anomalies || []).length > 0).length}</li>
              </ul>
            </div>
          </div>
          {/* Recent Expenditures - detailed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenditures (Detailed)</h3>
              <p className="text-sm text-gray-600">Complete file-like view with AI and approvals</p>
            </div>
            <div className="divide-y divide-gray-200">
              {expenditures.slice(0, 6).map((e) => (
                <div key={e.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{e.description}</div>
                      <div className="text-sm text-gray-600">₹{e.amount.toLocaleString()} • {e.category} • {e.createdAt.toLocaleDateString()}</div>
                      {e.vendorProof && (
                        <div className="mt-2 text-xs text-gray-600">Proof: {e.vendorProof.images.length} image(s) • {e.vendorProof.location.join(', ')} • {e.vendorProof.timestamp.toLocaleString()}</div>
                      )}
                      {e.aiVerification && (
                        <div className="mt-1 text-xs text-gray-600">AI: auth {Math.round((e.aiVerification.authenticity || 0) * 100)}% • anomalies {e.aiVerification.anomalies.length}</div>
                      )}
                      {e.quorum && (
                        <div className="mt-1 text-xs text-gray-600">Quorum: {e.quorum.current}/{e.quorum.required} {e.quorum.achieved ? '(Achieved)' : ''}</div>
                      )}
                      <div className="mt-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-900 mb-2">Expenditure Report</div>
                        <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                          <li>Proof summary: {(e.vendorProof?.images.length || 0)} photo(s){e.vendorProof ? ` • ${e.vendorProof.location[0]}, ${e.vendorProof.location[1]}` : ''}</li>
                          <li>AI verification: {e.aiVerification ? `${Math.round((e.aiVerification.authenticity || 0) * 100)}% authenticity • ${e.aiVerification.anomalies.length} anomaly(-ies)` : 'Pending'}</li>
                          <li>Beneficiary quorum: {e.quorum ? `${e.quorum.current}/${e.quorum.required} ${e.quorum.achieved ? '(Achieved)' : '(Pending)'}` : 'N/A'}</li>
                          <li>Status note: {e.status === 'completed' ? 'Completed and settled' : e.status === 'beneficiary_approved' ? 'Awaiting final settlement' : e.status === 'ai_verified' ? 'Awaiting beneficiary confirmations' : e.status === 'vendor_submitted' ? 'Under AI review' : 'Pending processing'}</li>
                          <li>Risk level: {e.aiVerification && e.aiVerification.anomalies.length > 0 ? 'Medium (review anomalies)' : 'Low'}</li>
                        </ul>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'completed' ? 'bg-green-100 text-green-800' :
                      e.status === 'ai_verified' ? 'bg-blue-100 text-blue-800' :
                        e.status === 'beneficiary_approved' ? 'bg-purple-100 text-purple-800' :
                          e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {e.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {expenditures.length === 0 && (
                <div className="p-6 text-sm text-gray-500">No expenditures yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
            <button onClick={()=>setShowNewProject(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>

          {showNewProject && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-gray-900">Create New Project</div>
                <button onClick={()=>setShowNewProject(false)} className="text-sm text-gray-600">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Title" value={newProject.title} onChange={(e)=>setNewProject(prev=>({...prev, title:e.target.value}))} />
                <input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Category" value={newProject.category} onChange={(e)=>setNewProject(prev=>({...prev, category:e.target.value}))} />
                <input type="number" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Target Amount (₹)" value={newProject.targetAmount} onChange={(e)=>setNewProject(prev=>({...prev, targetAmount:Number(e.target.value)}))} />
                <input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Location Address" value={newProject.locationAddress} onChange={(e)=>setNewProject(prev=>({...prev, locationAddress:e.target.value}))} />
                <input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Image URL (optional)" value={newProject.imageUrl} onChange={(e)=>setNewProject(prev=>({...prev, imageUrl:e.target.value}))} />
                <input type="number" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Beneficiaries (optional)" value={newProject.beneficiaryCount} onChange={(e)=>setNewProject(prev=>({...prev, beneficiaryCount:Number(e.target.value)}))} />
              </div>
              <div className="mt-3">
                <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Description" value={newProject.description} onChange={(e)=>setNewProject(prev=>({...prev, description:e.target.value}))} />
              </div>
              <div className="mt-4">
                <button
                  onClick={async ()=>{
                    if(!newProject.title || !newProject.description || !newProject.category || !newProject.locationAddress || !newProject.targetAmount){ toast.error('Fill required fields'); return; }
                    try {
                      const created = await api.createProject({
                        title: newProject.title,
                        description: newProject.description,
                        targetAmount: newProject.targetAmount,
                        ngoId: 'ngo1',
                        ngoName: 'Water for All Foundation',
                        category: newProject.category,
                        locationAddress: newProject.locationAddress,
                        imageUrl: newProject.imageUrl,
                        beneficiaryCount: newProject.beneficiaryCount
                      });
                      setProjects(prev=> (prev.some(p=>p.id===created.id) ? prev : [created, ...prev]));
                      setShowNewProject(false);
                      setNewProject({ title: '', description: '', targetAmount: 0, category: '', locationAddress: '', imageUrl: '', beneficiaryCount: 0 });
                      toast.success('Project created');
                    } catch {
                      toast.error('Failed to create project');
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >Create</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        ₹{project.raisedAmount.toLocaleString()} / ₹{project.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(project.raisedAmount / project.targetAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {project.status.toUpperCase()}
                    </span>
                  <div className="flex items-center text-sm text-gray-500 gap-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {project.beneficiaryCount} beneficiaries
                    </div>
                    <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-700 text-xs">View Details</Link>
                    <button
                      onClick={async ()=>{
                        try {
                          await api.deleteProject(project.id);
                          setProjects(prev=>prev.filter(p=>p.id!==project.id));
                          toast.success('Project deleted');
                        } catch {
                          toast.error('Failed to delete project');
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >Delete</button>
                  </div>
                  </div>

                  {project.status === 'active' && (
                    <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 mb-3">Add Update</div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Stage"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={projectUpdateDrafts[project.id]?.stage || ''}
                          onChange={(e)=>setProjectUpdateDrafts(prev=>({
                            ...prev,
                            [project.id]: { stage: e.target.value, percent: prev[project.id]?.percent || 0, note: prev[project.id]?.note || '', transactionsNote: prev[project.id]?.transactionsNote || '' }
                          }))}
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="%"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={projectUpdateDrafts[project.id]?.percent ?? 0}
                          onChange={(e)=>setProjectUpdateDrafts(prev=>({
                            ...prev,
                            [project.id]: { stage: prev[project.id]?.stage || '', percent: Number(e.target.value), note: prev[project.id]?.note || '', transactionsNote: prev[project.id]?.transactionsNote || '' }
                          }))}
                        />
                        <input
                          type="text"
                          placeholder="Note"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={projectUpdateDrafts[project.id]?.note || ''}
                          onChange={(e)=>setProjectUpdateDrafts(prev=>({
                            ...prev,
                            [project.id]: { stage: prev[project.id]?.stage || '', percent: prev[project.id]?.percent || 0, note: e.target.value, transactionsNote: prev[project.id]?.transactionsNote || '' }
                          }))}
                        />
                        <input
                          type="text"
                          placeholder="Transactions note"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={projectUpdateDrafts[project.id]?.transactionsNote || ''}
                          onChange={(e)=>setProjectUpdateDrafts(prev=>({
                            ...prev,
                            [project.id]: { stage: prev[project.id]?.stage || '', percent: prev[project.id]?.percent || 0, note: prev[project.id]?.note || '', transactionsNote: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={async ()=>{
                            const d = projectUpdateDrafts[project.id] || { stage: '', percent: 0, note: '', transactionsNote: '' };
                            if(!d.stage){ toast.error('Stage is required'); return; }
                            try {
                              const u = await api.addProjectUpdate(project.id, d.stage, d.percent || 0, d.note, d.transactionsNote);
                              setUpdates(prev=>[u, ...prev]);
                              setProjectUpdateDrafts(prev=>({ ...prev, [project.id]: { stage: '', percent: 0, note: '', transactionsNote: '' } }));
                              toast.success('Update posted');
                            } catch {
                              toast.error('Failed to post update');
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                        >Post Update</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenditures Tab */}
      {activeTab === 'expenditures' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Expenditure Management</h2>
            <button onClick={()=>setShowNewExpenditure(true)} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Expenditure</span>
            </button>
          </div>

          {showNewExpenditure && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-gray-900">Create New Expenditure</div>
                <button onClick={()=>setShowNewExpenditure(false)} className="text-sm text-gray-600">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Project</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={newExpenditure.projectId}
                    onChange={(e)=>setNewExpenditure(prev=>({...prev, projectId:e.target.value}))}
                  >
                    <option value="">Select project</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., Supplies, Equipment"
                    value={newExpenditure.category}
                    onChange={async (e)=>{
                      const category = e.target.value;
                      setNewExpenditure(prev=>({...prev, category}));
                      try {
                        const list = category ? await api.getVendors(category) : [];
                        setVendorsForNewExp(list);
                      } catch {}
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vendor</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={newExpenditure.vendorId}
                    onChange={(e)=>setNewExpenditure(prev=>({...prev, vendorId:e.target.value}))}
                  >
                    <option value="">Select vendor</option>
                    {vendorsForNewExp.map(v => (<option key={v.id} value={v.id}>{v.name} ({v.location}) ★{v.rating}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={newExpenditure.amount}
                    onChange={(e)=>setNewExpenditure(prev=>({...prev, amount:Number(e.target.value)}))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., Delivered 50 books"
                    value={newExpenditure.description}
                    onChange={(e)=>setNewExpenditure(prev=>({...prev, description:e.target.value}))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={async ()=>{
                    const d = newExpenditure;
                    if(!d.projectId || !d.category || !d.vendorId || !d.amount || !d.description){ toast.error('Fill all fields'); return; }
                    try {
                      const created = await api.createExpenditure({ projectId: d.projectId, category: d.category, vendorId: d.vendorId, amount: d.amount, description: d.description });
                      setExpenditures(prev=>[created, ...prev]);
                      setShowNewExpenditure(false);
                      setNewExpenditure({ projectId: '', category: '', vendorId: '', amount: 0, description: '' });
                      setVendorsForNewExp([]);
                      toast.success('Expenditure created');
                    } catch {
                      toast.error('Failed to create expenditure');
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >Create Expenditure</button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {expenditures.map((expenditure) => (
              <div key={expenditure.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{expenditure.description}</h3>
                    <p className="text-sm text-gray-600">Amount: ₹{expenditure.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {expenditure.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Vendor Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Vendor</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={selectedVendor[expenditure.id] ?? expenditure.vendorId ?? ''}
                      onChange={(e) => setSelectedVendor(prev => ({ ...prev, [expenditure.id]: e.target.value }))}
                    >
                      <option value="">Select vendor</option>
                      {(vendorsByCategory[expenditure.category] || []).map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.location}) ★{v.rating}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={async () => {
                        const vendorId = selectedVendor[expenditure.id];
                        if (!vendorId) { toast.error('Select a vendor first'); return; }
                        try {
                          const updated = await api.assignVendorToExpenditure(expenditure.id, vendorId);
                          setExpenditures(prev => prev.map(e => e.id === updated.id ? updated : e));
                          toast.success('Vendor assigned');
                        } catch (e) {
                          toast.error('Failed to assign vendor');
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Assign Vendor
                    </button>
                  </div>
                </div>

                {/* Vendor Proof Upload */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Upload Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setProofFiles(prev => ({ ...prev, [expenditure.id]: files as File[] }));
                      }}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input
                      type="text"
                      value={proofDesc[expenditure.id] || ''}
                      onChange={(e) => setProofDesc(prev => ({ ...prev, [expenditure.id]: e.target.value }))}
                      placeholder="e.g., Delivered 50 books"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={async () => {
                        const files = proofFiles[expenditure.id];
                        if (!files || files.length === 0) { toast.error('Select photos first'); return; }
                        const desc = proofDesc[expenditure.id] || '';
                        const getLocation = (): Promise<[number, number]> => new Promise((resolve) => {
                          if (navigator && 'geolocation' in navigator) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
                              () => resolve([26.9124, 75.7873])
                            );
                          } else {
                            resolve([26.9124, 75.7873]);
                          }
                        });
                        try {
                          const location = await getLocation();
                          const updated = await api.uploadVendorProof(expenditure.id, files, desc, location);
                          setExpenditures(prev => prev.map(e => e.id === updated.id ? updated : e));
                          toast.success('Proof uploaded and sent for AI verification');
                        } catch (e) {
                          toast.error('Failed to upload proof');
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Upload Proof
                    </button>
                  </div>
                </div>

                <TripleLockStatus expenditure={expenditure} />

                {/* NGO Approval / Payment */}
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={expenditure.status === 'completed'}
                    onClick={async () => {
                      try {
                        const updated = await api.updateExpenditure(expenditure.id, { status: 'completed' });
                        setExpenditures(prev => prev.map(e => e.id === updated.id ? updated : e));
                        toast.success('Approved and payment released');
                      } catch (e) {
                        toast.error('Failed to approve payment');
                      }
                    }}
                    className={`px-3 py-2 rounded-md text-sm text-white ${expenditure.status === 'completed' ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                  >
                    Approve & Release Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Project Update</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Project</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={newUpdate.projectId}
                  onChange={(e)=>setNewUpdate(prev=>({...prev, projectId:e.target.value}))}
                >
                  <option value="">Select project</option>
                  {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stage</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g., Procurement, In Progress"
                  value={newUpdate.stage}
                  onChange={(e)=>setNewUpdate(prev=>({...prev, stage:e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Percent</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="0-100"
                  value={newUpdate.percent}
                  onChange={(e)=>setNewUpdate(prev=>({...prev, percent:Number(e.target.value)}))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Note</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Add a brief note"
                  value={newUpdate.note}
                  onChange={(e)=>setNewUpdate(prev=>({...prev, note:e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Transactions Note</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Describe related transactions/expenditures"
                  value={newUpdate.transactionsNote}
                  onChange={(e)=>setNewUpdate(prev=>({...prev, transactionsNote:e.target.value}))}
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={async ()=>{
                  if(!newUpdate.projectId || !newUpdate.stage){ toast.error('Project and Stage required'); return; }
                  try {
                    const u = await api.addProjectUpdate(newUpdate.projectId, newUpdate.stage, newUpdate.percent, newUpdate.note, newUpdate.transactionsNote);
                    setUpdates(prev=>[u, ...prev]);
                    setNewUpdate({ projectId: '', stage: '', percent: 0, note: '', transactionsNote: '' });
                    toast.success('Update posted');
                  } catch {
                    toast.error('Failed to post update');
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >Post Update</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Project Updates</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {updates.map(u => (
                <div key={u.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{projects.find(p=>p.id===u.projectId)?.title || 'Project'} • {u.stage}</div>
                      <div className="text-sm text-gray-600">{u.createdAt.toLocaleString()} • {u.percent}%</div>
                      {u.note && <div className="text-sm text-gray-700 mt-1">{u.note}</div>}
                      {u.transactionsNote && <div className="text-xs text-gray-600 mt-1">Transactions: {u.transactionsNote}</div>}
                    </div>
                    <div className="text-xs text-gray-500">Donor approvals: {u.approvals.filter(a=>a.approved).length}</div>
                  </div>
                </div>
              ))}
              {updates.length===0 && <div className="p-6 text-sm text-gray-500">No updates yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;