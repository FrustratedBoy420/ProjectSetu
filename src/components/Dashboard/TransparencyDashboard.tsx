import React, { useEffect, useState } from 'react';
import { Eye, MapPin, Images, CheckCircle2, Clock, FileText, UserCheck, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project, Expenditure, DashboardStats, ProjectUpdate } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TransparencyDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, projectsData, expendituresData, updatesData] = await Promise.all([
                    api.getDashboardStats('user-shared', 'shared'),
                    api.getProjects(),
                    api.getExpenditures(),
                    api.getProjectUpdates()
                ]);
                setStats(statsData);
                setProjects(projectsData);
                setExpenditures(expendituresData);
                setUpdates(updatesData);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Transparency Dashboard</h1>
                <p className="text-blue-100">Unified view for donors and beneficiaries: donations, allocations, and verified proof.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Donations</p>
                            <p className="text-2xl font-bold text-gray-900">₹{stats?.totalDonations.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Beneficiaries</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalBeneficiaries.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Transparency</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.transparencyScore}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Projects</p>
                            <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Projects & Allocation</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {projects.map((project) => (
                        <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {project.location.address}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Eye className="h-4 w-4 mr-1" />
                                            {Math.round((project.raisedAmount / project.targetAmount) * 100)}% funded
                                        </div>
                                    <Link to={`/projects/${project.id}`} className="text-xs text-blue-600 hover:text-blue-700">View Details</Link>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Allocation</div>
                                    <div className="text-lg font-semibold text-gray-900">₹{project.raisedAmount.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(project.raisedAmount / project.targetAmount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h5 className="text-sm font-semibold text-gray-900 mb-3">Project Updates</h5>
                                <div className="space-y-3">
                                    {updates.filter(u=>u.projectId===project.id).map(u => (
                                        <div key={u.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">{u.stage} • {u.percent}%</div>
                                                    <div className="text-xs text-gray-500">{u.createdAt.toLocaleString()}</div>
                                                    {u.note && <div className="text-sm text-gray-700 mt-1">{u.note}</div>}
                                                    {u.transactionsNote && <div className="text-xs text-gray-600 mt-1">Transactions: {u.transactionsNote}</div>}
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">
                                                    Donor approvals: {u.approvals.filter(a=>a.approved).length}
                                                </div>
                                            </div>
                                            {user?.role === 'donor' && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={async ()=>{
                                                            try {
                                                                const updated = await api.approveProjectUpdate(u.id, user.id, true);
                                                                setUpdates(prev => prev.map(x => x.id===updated.id? updated : x));
                                                                toast.success('Progress approved');
                                                            } catch {
                                                                toast.error('Failed to approve');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-green-700"
                                                    >
                                                        <ThumbsUp className="h-3 w-3"/> Approve Progress
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {updates.filter(u=>u.projectId===project.id).length===0 && (
                                        <div className="text-xs text-gray-500">No updates yet.</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5">
                                <h5 className="text-sm font-semibold text-gray-900 mb-3">Expenditures & Proof</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {expenditures.filter(e => e.projectId === project.id).map(exp => (
                                        <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{exp.description}</p>
                                                    <p className="text-sm text-gray-600">Amount: ₹{exp.amount.toLocaleString()}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${exp.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    exp.status === 'ai_verified' ? 'bg-blue-100 text-blue-800' :
                                                        exp.status === 'beneficiary_approved' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {exp.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            {exp.vendorProof && (
                                                <div className="mt-3">
                                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                                        <Images className="h-4 w-4 mr-1" /> Proof of delivery
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {exp.vendorProof.images.slice(0, 3).map((img, idx) => (
                                                            <img key={idx} src={img} alt="proof" className="h-16 w-24 object-cover rounded" />
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Geo: {exp.vendorProof.location[0]}, {exp.vendorProof.location[1]} · {exp.vendorProof.timestamp.toLocaleString()}
                                                    </div>
                                                    {exp.vendorProof.description && (
                                                        <div className="text-xs text-gray-600 mt-1">{exp.vendorProof.description}</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Beneficiary Approval */}
                                            <div className="mt-3">
                                                <div className="text-xs text-gray-600 mb-2">
                                                    Quorum: {exp.quorum?.current || 0}/{exp.quorum?.required || 3} {exp.quorum?.achieved ? '(Achieved)' : ''}
                                                </div>
                                                {user?.role === 'beneficiary' && !exp.quorum?.achieved && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const updated = await api.submitBeneficiaryApproval(exp.id, user.id, true, 'Looks good');
                                                                setExpenditures(prev => prev.map(e => e.id === updated.id ? updated : e));
                                                                toast.success('Approval submitted');
                                                            } catch (e) {
                                                                toast.error('Failed to submit approval');
                                                            }
                                                        }}
                                                        className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700"
                                                    >
                                                        Approve Delivery
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransparencyDashboard;


