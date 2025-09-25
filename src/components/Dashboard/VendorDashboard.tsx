import React, { useEffect, useState } from 'react';
import { Briefcase, CheckCircle, Clock, Globe, Loader2, Pencil, Save, Wallet, Camera, Star } from 'lucide-react';
import { Expenditure } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import CameraCapture from '../Shared/CameraCapture';

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
  const [activeTab, setActiveTab] = useState<'requests' | 'payments' | 'about' | 'notifications'>('requests');
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; createdAt: Date; read: boolean }[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [payments, setPayments] = useState<Expenditure[]>([]);
  const [profile, setProfile] = useState<{ about: string; website?: string; contacts?: string }>({ about: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqs, pays, prof, notes] = await Promise.all([
          api.getVendorRequests(vendorId),
          api.getVendorPayments(vendorId),
          api.getVendorProfile(vendorId),
          api.getNotifications(vendorId)
        ]);
        setRequests(reqs);
        setPayments(pays);
        setProfile(prof);
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
          {[{id:'requests',label:'Requests'},{id:'payments',label:'Payments'},{id:'about',label:'About'},{id:'notifications',label:'Notifications'}].map(t => (
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

          {/* Quick Proof Upload with geotag (for accepted requests) */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-blue-600" />
              <div className="font-medium text-gray-900">Capture Proof Photo (auto-geotag)</div>
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
            <CameraCapture onCapture={async (file)=>{
              try {
                const sel = (window as any).selectedReq as string;
                if (!sel) { toast.error('Select a request first'); return; }
                const parts = sel.split('|');
                const expId = parts[1];
                if (!expId) { toast.error('No expenditure linked'); return; }
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
                await api.uploadVendorProof(expId, [file], 'On-site proof', location);
                toast.success('Photo uploaded with geotag; visible publicly after approval');
              } catch {
                toast.error('Failed to upload proof');
              }
            }} />
            <div className="text-xs text-gray-500 mt-2">Location is attached automatically on upload by the platform and the photo will be public on approval.</div>
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
            </div>
          ))}
          {payments.length===0 && <div className="text-sm text-gray-500">No payments yet.</div>}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {!editing ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Briefcase className="h-5 w-5"/>Public Profile</h3>
                <button onClick={()=>setEditing(true)} className="flex items-center gap-1 text-sm text-blue-600"><Pencil className="h-4 w-4"/>Edit</button>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{profile.about}</p>
              {profile.website && <div className="mt-2 text-sm text-gray-600 flex items-center gap-1"><Globe className="h-4 w-4"/> {profile.website}</div>}
              {profile.contacts && <div className="mt-1 text-sm text-gray-600">{profile.contacts}</div>}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea value={profile.about} onChange={(e)=>setProfile(prev=>({...prev, about:e.target.value}))} className="w-full border border-gray-300 rounded-md p-2 h-28" />
              <input type="text" placeholder="Website" value={profile.website||''} onChange={(e)=>setProfile(prev=>({...prev, website:e.target.value}))} className="w-full border border-gray-300 rounded-md p-2" />
              <input type="text" placeholder="Contacts" value={profile.contacts||''} onChange={(e)=>setProfile(prev=>({...prev, contacts:e.target.value}))} className="w-full border border-gray-300 rounded-md p-2" />
              <div className="flex gap-2">
                <button
                  onClick={async ()=>{ try{ const saved=await api.updateVendorProfile(vendorId, profile); setProfile(saved); setEditing(false); toast.success('Profile saved'); }catch{ toast.error('Failed to save'); } }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
                ><Save className="h-4 w-4"/>Save</button>
                <button onClick={()=>setEditing(false)} className="border px-4 py-2 rounded-md text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> This information is public on your vendor page.</div>

          {/* Reviews Preview */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Recent Reviews</h4>
            <VendorReviews vendorId={vendorId} />
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

const VendorReviews: React.FC<{ vendorId: string }> = ({ vendorId }) => {
  const [reviews, setReviews] = useState<{ id: string; userName: string; rating: number; comment: string; createdAt: Date }[]>([]);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    (async ()=>{
      try {
        const data = await (await import('../../services/api')).getVendorReviews(vendorId);
        setReviews(data);
      } catch {}
    })();
  }, [vendorId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={()=>setNewRating(n)}><Star className={`h-5 w-5 ${newRating>=n?'text-yellow-500 fill-current':'text-gray-300'}`} /></button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={(e)=>setNewComment(e.target.value)}
          placeholder="Write a review..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={async ()=>{
            if(!newRating){ return; }
            try {
              const { addVendorReview } = await import('../../services/api');
              const r = await addVendorReview(vendorId, 'user1', 'User', newRating, newComment);
              setReviews(prev=>[r, ...prev]);
              setNewRating(0); setNewComment('');
            } catch {}
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
        >Submit</button>
      </div>
      <div className="space-y-2">
        {reviews.map(r => (
          <div key={r.id} className="border border-gray-100 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900 text-sm">{r.userName}</div>
              <div className="flex items-center gap-1 text-yellow-500">
                {[1,2,3,4,5].map(n => (<Star key={n} className={`h-3 w-3 ${r.rating>=n?'fill-current':''}`} />))}
              </div>
            </div>
            <div className="text-sm text-gray-600">{r.comment}</div>
            <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {reviews.length===0 && <div className="text-sm text-gray-500">No reviews yet.</div>}
      </div>
    </div>
  );
};


