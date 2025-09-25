import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Wallet, Camera, FileText } from 'lucide-react';
import { Expenditure } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
 

interface VendorRequest {
  id: string;
  ngoId: string;
  ngoName: string;
  projectId: string;
  projectTitle: string;
  description: string;
  amount: number;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: Date;
  expenditureId?: string;
}

const VendorDashboard: React.FC<{ vendorId?: string }> = ({ vendorId = 'vendor1' }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'payments' | 'notifications'>('requests');
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; createdAt: Date; read: boolean }[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [payments, setPayments] = useState<Expenditure[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [selectedExpForReceipt, setSelectedExpForReceipt] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [reqs, pays, notes] = await Promise.all([
          api.getVendorRequests(vendorId),
          api.getVendorPayments(vendorId),
          api.getNotifications(vendorId)
        ]);
        setRequests(reqs);
        setPayments(pays);
        setNotifications(notes);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load vendor data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-emerald-100">Manage NGO requests, track payments, and update your public profile.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[{id:'requests',label:'Requests'},{id:'payments',label:'Payments'},{id:'notifications',label:'Notifications'}].map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab===t.id?'border-blue-500 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >{t.label}</button>
          ))}
        </nav>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">{r.projectTitle}</div>
                <div className="text-sm text-gray-600">{r.ngoName} • {r.description}</div>
                <div className="text-sm text-gray-600">Amount: ₹{r.amount.toLocaleString()} • {r.createdAt.toLocaleDateString()}</div>
                <div className="mt-2">
                  <Link to={`/projects/${r.projectId}`} className="text-xs text-blue-600 hover:text-blue-700">View Details</Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${r.status==='pending'?'bg-yellow-100 text-yellow-800':r.status==='accepted'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{r.status.toUpperCase()}</span>
                {r.status === 'pending' && (
                  <button
                    onClick={async ()=>{
                      try { const u = await api.updateVendorRequestStatus(vendorId, r.id, 'accepted'); setRequests(prev=>prev.map(x=>x.id===r.id?u:x)); toast.success('Request accepted'); } catch { toast.error('Failed'); }
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                  >Accept</button>
                )}
                {r.status === 'accepted' && (
                  <button
                    onClick={async ()=>{
                      try { const u = await api.updateVendorRequestStatus(vendorId, r.id, 'completed'); setRequests(prev=>prev.map(x=>x.id===r.id?u:x)); toast.success('Marked completed'); } catch { toast.error('Failed'); }
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                  >Mark Completed</button>
                )}
              </div>
            </div>
          ))}
          {requests.length===0 && <div className="text-sm text-gray-500">No pending requests.</div>}

          {/* Proof Upload with geotag (for accepted requests) */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-blue-600" />
              <div className="font-medium text-gray-900">Upload Geotagged Photo</div>
            </div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
              onChange={(e)=>{ (window as any).selectedReq = e.target.value; }}
              defaultValue=""
            >
              <option value="" disabled>Select accepted request</option>
              {requests.filter(r=>r.status==='accepted').map(r => (
                <option key={r.id} value={`${r.id}|${r.expenditureId||''}`}>{r.projectTitle} • ₹{r.amount.toLocaleString()}</option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e)=> setProofFiles(Array.from(e.target.files || []))}
              className="w-full text-sm mb-2"
            />
            <button
              onClick={async ()=>{
                try {
                  const sel = (window as any).selectedReq as string;
                  if (!sel) { toast.error('Select a request first'); return; }
                  const parts = sel.split('|');
                  const expId = parts[1];
                  if (!expId) { toast.error('No expenditure linked'); return; }
                  if (!proofFiles.length) { toast.error('Select at least one photo'); return; }
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
                  const location = await getLocation();
                  await api.uploadVendorProof(expId, proofFiles, 'On-site proof', location);
                  setProofFiles([]);
                  toast.success('Photo(s) uploaded with geotag; visible publicly after approval');
                } catch {
                  toast.error('Failed to upload proof');
                }
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
            >Upload</button>
            <div className="text-xs text-gray-500 mt-2">Allow location when prompted so the platform can attach coordinates automatically. Uploaded photos include a timestamp.</div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.map(p => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600" />
                <div className="text-sm text-gray-700">₹{p.amount.toLocaleString()} • {p.category}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${p.status==='completed'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-800'}`}>{p.status.toUpperCase()}</span>
              <Link to={`/projects/${p.projectId}`} className="text-xs text-blue-600 hover:text-blue-700">View Details</Link>
            </div>
          ))}
          {payments.length===0 && <div className="text-sm text-gray-500">No payments yet.</div>}

          {/* Receipt OCR + Budget Verification */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-purple-600" />
              <div className="font-medium text-gray-900">Upload Receipt for AI Verification (OCR + Budget Check)</div>
            </div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
              onChange={(e)=> setSelectedExpForReceipt(e.target.value)}
              value={selectedExpForReceipt}
            >
              <option value="" disabled>Select expenditure</option>
              {payments.map(p => (
                <option key={p.id} value={p.id}>Expenditure #{p.id} • Project {p.projectId} • ₹{p.amount.toLocaleString()}</option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e)=> setReceiptFile(e.target.files?.[0] || null)}
              className="w-full text-sm mb-2"
            />
            <button
              onClick={async ()=>{
                try {
                  if (!selectedExpForReceipt) { toast.error('Select an expenditure'); return; }
                  if (!receiptFile) { toast.error('Choose a receipt file'); return; }
                  const updated = await api.uploadVendorReceipt(selectedExpForReceipt, receiptFile);
                  setPayments(prev => prev.map(p => p.id===updated.id? updated : p));
                  toast.success(updated.aiVerification?.verified ? 'Receipt verified within budget' : 'Receipt analyzed with anomalies');
                } catch (e) {
                  console.error(e);
                  toast.error('Receipt upload failed');
                }
              }}
              className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm"
            >Analyze Receipt</button>
            <div className="text-xs text-gray-500 mt-2">The AI reads the receipt (brand, quantity, price) and checks it against the project’s pre-approved itemized budget.</div>
          </div>
        </div>
      )}

      

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-white rounded-lg border p-4 ${n.read?'opacity-70':''}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{n.title}</div>
                {!n.read && (
                  <button
                    onClick={async ()=>{ await api.markNotificationRead(vendorId, n.id); setNotifications(prev=>prev.map(x=>x.id===n.id?{...x, read:true}:x)); }}
                    className="text-sm text-blue-600"
                  >Mark as read</button>
                )}
              </div>
              <div className="text-sm text-gray-600">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {notifications.length===0 && <div className="text-sm text-gray-500">No notifications.</div>}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
