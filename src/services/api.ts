import { Project, Transaction, Expenditure, DashboardStats, Vendor, Review, ProjectUpdate } from '../types';
import { emitDonationEvent } from './events';

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Providing clean water access to rural communities through bore well installation and water purification systems.',
    targetAmount: 500000,
    raisedAmount: 350000,
    ngoId: 'ngo1',
    ngoName: 'Water for All Foundation',
    beneficiaryCount: 1200,
    category: 'Water & Sanitation',
    location: {
      address: 'Rajasthan, India',
      coordinates: [26.9124, 75.7873]
    },
    status: 'active',
    images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
    createdAt: new Date('2024-01-15'),
    endDate: new Date('2024-06-15')
  },
  {
    id: '2',
    title: 'Education for All',
    description: 'Building schools and providing educational materials for underprivileged children in remote areas.',
    targetAmount: 750000,
    raisedAmount: 620000,
    ngoId: 'ngo2',
    ngoName: 'Education First NGO',
    beneficiaryCount: 800,
    category: 'Education',
    location: {
      address: 'Bihar, India',
      coordinates: [25.0961, 85.3131]
    },
    status: 'active',
    images: ['https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg'],
    createdAt: new Date('2024-02-01'),
    endDate: new Date('2024-08-01')
  }
];

const mockExpenditures: Expenditure[] = [
  {
    id: '1',
    projectId: '1',
    vendorId: 'vendor1',
    amount: 25000,
    description: 'Water pump installation - Phase 1',
    category: 'Equipment',
    status: 'completed',
    vendorProof: {
      images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
      location: [26.9124, 75.7873],
      timestamp: new Date('2024-01-20'),
      description: 'Water pump successfully installed and tested'
    },
    aiVerification: {
      ocrResults: { amount: 25000, vendor: 'AquaTech Solutions' },
      authenticity: 0.95,
      anomalies: [],
      verified: true,
      timestamp: new Date('2024-01-20')
    },
    beneficiaryApproval: {
      beneficiaryId: 'ben1',
      approved: true,
      feedback: 'Water pump is working perfectly, thank you!',
      timestamp: new Date('2024-01-21')
    },
    createdAt: new Date('2024-01-18')
  },
  {
    id: '2',
    projectId: '1',
    vendorId: 'vendor2',
    amount: 15000,
    description: 'Water purification tablets distribution',
    category: 'Supplies',
    status: 'ai_verified',
    vendorProof: {
      images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
      location: [26.9124, 75.7873],
      timestamp: new Date('2024-01-25'),
      description: 'Distributed water purification tablets to 200 families'
    },
    aiVerification: {
      ocrResults: { amount: 15000, vendor: 'HealthCare Supplies Ltd' },
      authenticity: 0.92,
      anomalies: [],
      verified: true,
      timestamp: new Date('2024-01-25')
    },
    createdAt: new Date('2024-01-23')
  },
  {
    id: '3',
    projectId: '1',
    vendorId: 'vendor3',
    amount: 30000,
    description: 'Bore well drilling - Location A',
    category: 'Infrastructure',
    status: 'vendor_submitted',
    vendorProof: {
      images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
      location: [26.9124, 75.7873],
      timestamp: new Date('2024-02-01'),
      description: 'Bore well drilling completed at 150 feet depth'
    },
    createdAt: new Date('2024-01-28')
  },
  {
    id: '4',
    projectId: '1',
    vendorId: 'vendor4',
    amount: 8000,
    description: 'Community training on water conservation',
    category: 'Training',
    status: 'pending',
    createdAt: new Date('2024-02-05')
  },
  {
    id: '5',
    projectId: '2',
    vendorId: 'vendor5',
    amount: 45000,
    description: 'School building construction - Phase 1',
    category: 'Infrastructure',
    status: 'completed',
    vendorProof: {
      images: ['https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg'],
      location: [25.0961, 85.3131],
      timestamp: new Date('2024-02-10'),
      description: 'Foundation and walls completed for new classroom block'
    },
    aiVerification: {
      ocrResults: { amount: 45000, vendor: 'BuildRight Construction' },
      authenticity: 0.97,
      anomalies: [],
      verified: true,
      timestamp: new Date('2024-02-10')
    },
    beneficiaryApproval: {
      beneficiaryId: 'ben2',
      approved: true,
      feedback: 'The new classroom is excellent! Children are very happy.',
      timestamp: new Date('2024-02-12')
    },
    createdAt: new Date('2024-02-08')
  },
  {
    id: '6',
    projectId: '2',
    vendorId: 'vendor6',
    amount: 12000,
    description: 'Educational materials and books',
    category: 'Supplies',
    status: 'beneficiary_approved',
    vendorProof: {
      images: ['https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg'],
      location: [25.0961, 85.3131],
      timestamp: new Date('2024-02-15'),
      description: 'Delivered textbooks and stationery to 150 students'
    },
    aiVerification: {
      ocrResults: { amount: 12000, vendor: 'EduSupply Co.' },
      authenticity: 0.94,
      anomalies: [],
      verified: true,
      timestamp: new Date('2024-02-15')
    },
    beneficiaryApproval: {
      beneficiaryId: 'ben3',
      approved: true,
      feedback: 'Books received in good condition. Thank you for supporting our children.',
      timestamp: new Date('2024-02-16')
    },
    createdAt: new Date('2024-02-13')
  }
];

const mockVendors: Vendor[] = [
  { id: 'vendor1', name: 'AquaTech Solutions', category: 'Equipment', rating: 4.6, location: 'Jaipur' },
  { id: 'vendor2', name: 'HealthCare Supplies Ltd', category: 'Supplies', rating: 4.5, location: 'Jaipur' },
  { id: 'vendor3', name: 'BoreWell Pros', category: 'Infrastructure', rating: 4.3, location: 'Jaipur' },
  { id: 'vendor4', name: 'Community Trainers Co', category: 'Training', rating: 4.7, location: 'Jaipur' },
  { id: 'vendor5', name: 'BuildRight Construction', category: 'Infrastructure', rating: 4.4, location: 'Patna' },
  { id: 'vendor6', name: 'EduSupply Co.', category: 'Supplies', rating: 4.2, location: 'Patna' },
  { id: 'vendor7', name: 'Stationery Hub', category: 'Supplies', rating: 4.1, location: 'Delhi' },
  { id: 'vendor8', name: 'Green Earth Equipments', category: 'Equipment', rating: 4.0, location: 'Delhi' },
  { id: 'vendor9', name: 'Swift Logistics', category: 'Logistics', rating: 4.3, location: 'Delhi' },
  { id: 'vendor10', name: 'SkillBridge Trainers', category: 'Training', rating: 4.8, location: 'Mumbai' }
];

// Mock per-project itemized budgets for OCR verification
const projectBudgets: Record<string, Array<{ item: string; brand?: string; maxUnitPrice: number }>> = {
  '1': [
    { item: 'Water pump', brand: 'AquaTech', maxUnitPrice: 30000 },
    { item: 'Purification tablets', brand: 'HealthCare', maxUnitPrice: 100 },
  ],
  '2': [
    { item: 'Bricks', maxUnitPrice: 12 },
    { item: 'Cement', brand: 'BuildRight', maxUnitPrice: 450 },
    { item: 'Textbooks', brand: 'EduSupply', maxUnitPrice: 250 },
  ],
};

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjects;
  },

  getProject: async (id: string): Promise<Project | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.find(p => p.id === id) || null;
  },

  createProject: async (data: {
    title: string;
    description: string;
    targetAmount: number;
    ngoId: string;
    ngoName: string;
    category: string;
    locationAddress: string;
    imageUrl?: string;
    endDate?: Date;
    beneficiaryCount?: number;
  }): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const project: Project = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      targetAmount: data.targetAmount,
      raisedAmount: 0,
      ngoId: data.ngoId,
      ngoName: data.ngoName,
      beneficiaryCount: data.beneficiaryCount ?? 0,
      category: data.category,
      location: {
        address: data.locationAddress,
        coordinates: [26.9124, 75.7873]
      },
      status: 'active',
      images: [data.imageUrl || 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg'],
      createdAt: new Date(),
      endDate: data.endDate || new Date(Date.now() + 1000*60*60*24*90)
    };
    mockProjects.unshift(project);
    return project;
  },

  deleteProject: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = mockProjects.findIndex(p => p.id === id);
    if (idx >= 0) {
      mockProjects.splice(idx, 1);
    } else {
      throw new Error('Project not found');
    }
  },

  // Transactions
  createTransaction: async (projectId: string, amount: number): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const tx = {
      id: Date.now().toString(),
      projectId,
      donorId: 'donor1',
      amount,
      currency: 'INR',
      blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'completed',
      createdAt: new Date()
    } as Transaction;
    // emit donation event for real-time UI updates
    emitDonationEvent({ projectId, amount });
    return tx;
  },

  // Expenditures
  getExpenditures: async (projectId?: string): Promise<Expenditure[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return projectId ? mockExpenditures.filter(e => e.projectId === projectId) : mockExpenditures;
  },

  createExpenditure: async (data: Partial<Expenditure>): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: Date.now().toString(),
      projectId: data.projectId!,
      vendorId: data.vendorId!,
      amount: data.amount!,
      description: data.description!,
      category: data.category!,
      status: 'pending',
      createdAt: new Date()
    };
  },

  updateExpenditure: async (id: string, updates: Partial<Expenditure>): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const existing = mockExpenditures.find(e => e.id === id);
    const updated = { ...existing!, ...updates } as Expenditure;
    const index = mockExpenditures.findIndex(e => e.id === id);
    if (index >= 0) mockExpenditures[index] = updated;
    return updated;
  },

  // Vendors
  getVendors: async (category?: string): Promise<Vendor[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return category ? mockVendors.filter(v => v.category === category) : mockVendors;
  },

  assignVendorToExpenditure: async (expenditureId: string, vendorId: string): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = mockExpenditures.find(e => e.id === expenditureId);
    if (!existing) throw new Error('Expenditure not found');
    return await api.updateExpenditure(expenditureId, { vendorId, status: 'pending' });
  },

  // --- Vendor dashboard mocks ---
  getVendorRequests: async (_vendorId: string): Promise<Array<{ id: string; ngoId: string; ngoName: string; projectId: string; projectTitle: string; description: string; amount: number; status: 'pending' | 'accepted' | 'completed'; createdAt: Date; expenditureId?: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Link first expenditure as an example request
    const first = mockExpenditures[0];
    return [
      { id: 'req1', ngoId: 'ngo1', ngoName: 'Water for All Foundation', projectId: '1', projectTitle: 'Clean Water Initiative', description: first.description, amount: first.amount, status: 'pending', createdAt: new Date('2024-02-20'), expenditureId: first.id }
    ];
  },

  updateVendorRequestStatus: async (_vendorId: string, _requestId: string, status: 'pending' | 'accepted' | 'completed') => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id: _requestId, ngoId: 'ngo1', ngoName: 'Water for All Foundation', projectId: '1', projectTitle: 'Clean Water Initiative', description: 'Updated', amount: 10000, status, createdAt: new Date(), expenditureId: mockExpenditures[0]?.id };
  },

  getVendorPayments: async (vendorId: string): Promise<Expenditure[]> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockExpenditures.filter(e => e.vendorId === vendorId);
  },

  getVendorProfile: async (_vendorId: string): Promise<{ about: string; website?: string; contacts?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { about: 'We deliver quality services to NGOs with transparency.' };
  },

  updateVendorProfile: async (_vendorId: string, data: { about?: string; website?: string; contacts?: string }): Promise<{ about: string; website?: string; contacts?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { about: data.about || 'We deliver quality services to NGOs with transparency.', website: data.website, contacts: data.contacts };
  },

  // Notifications (mock)
  getNotifications: async (_toId: string): Promise<Array<{ id: string; title: string; message: string; createdAt: Date; read: boolean }>> => {
    await new Promise(resolve => setTimeout(resolve, 120));
    return [
      { id: 'n1', title: 'Welcome', message: 'You will receive NGO requests here.', createdAt: new Date(), read: false }
    ];
  },
  markNotificationRead: async (_toId: string, _notificationId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  uploadVendorProof: async (
    expenditureId: string,
    files: File[],
    description: string,
    location: [number, number]
  ): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const imageUrls = files.map(() => 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg');
    const proof = {
      images: imageUrls,
      location,
      timestamp: new Date(),
      description
    } as Expenditure['vendorProof'];
    // Auto-run AI verification mock
    const ai = {
      ocrResults: { quantity: 50, brand: 'Generic', price: Math.floor(Math.random() * 20000) + 5000 },
      authenticity: 0.9 + Math.random() * 0.08,
      anomalies: Math.random() > 0.85 ? ['Low-resolution image detected'] : [],
      verified: Math.random() > 0.05,
      timestamp: new Date()
    } as Expenditure['aiVerification'];
    const existing = mockExpenditures.find(e => e.id === expenditureId);
    const approvals = existing?.approvals || [];
    const quorum = existing?.quorum || { required: 3, current: approvals.filter(a => a.approved).length, achieved: false };
    return await api.updateExpenditure(expenditureId, { vendorProof: proof, aiVerification: ai, status: 'vendor_submitted', approvals, quorum });
  },

  // Vendor uploads receipt for OCR + budget verification
  uploadVendorReceipt: async (
    expenditureId: string,
    file: File
  ): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 900));
    const existing = mockExpenditures.find(e => e.id === expenditureId);
    if (!existing) throw new Error('Expenditure not found');

    // Run mock OCR
    const ocr = await api.verifyReceiptOCR(file);

    // Compare with itemized project budget
    const budget = projectBudgets[existing.projectId] || [];
    const anomalies: string[] = [];

    // Brand check (if brand exists in budget for similar item category)
    const brandAllowed = budget.some(b =>
      !b.brand || (ocr.brand || '').toLowerCase().includes(b.brand.toLowerCase())
    );
    if (!brandAllowed) {
      anomalies.push(`Brand mismatch: ${ocr.brand || 'Unknown'} not in approved list`);
    }

    // Price check against maxUnitPrice (assume price represents total price; approximate unit price)
    const maxAllowed = Math.max(...budget.map(b => b.maxUnitPrice), 0) || 0;
    const withinBudget = ocr.price <= Math.max(maxAllowed * Math.max(1, ocr.quantity), maxAllowed);
    if (!withinBudget) {
      anomalies.push(`Price exceeds budget threshold (₹${ocr.price.toLocaleString()})`);
    }

    // Quantity sanity check
    if (ocr.quantity <= 0) {
      anomalies.push('Quantity must be greater than zero');
    }

    const verified = brandAllowed && withinBudget && anomalies.length === 0;

    const aiVerification: Expenditure['aiVerification'] = {
      ocrResults: { brand: ocr.brand, quantity: ocr.quantity, price: ocr.price },
      authenticity: verified ? 0.96 : 0.78,
      anomalies,
      verified,
      timestamp: new Date()
    };

    const status: Expenditure['status'] = verified ? 'ai_verified' : 'rejected';

    return await api.updateExpenditure(expenditureId, { aiVerification, status });
  },

  // AI Verification
  verifyDocument: async (_file: File): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      ocrResults: {
        amount: Math.floor(Math.random() * 50000) + 10000,
        vendor: 'Sample Vendor Corp',
        date: new Date().toISOString().split('T')[0]
      },
      authenticity: 0.92 + Math.random() * 0.07,
      anomalies: Math.random() > 0.8 ? ['Unusual font detected'] : [],
      verified: Math.random() > 0.1
    };
  },

  verifyReceiptOCR: async (_file: File): Promise<{ brand: string; quantity: number; price: number; withinBudget: boolean; anomalies: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const brand = ['Generic', 'BrandX', 'BrandY'][Math.floor(Math.random() * 3)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = Math.floor(Math.random() * 50000) + 1000;
    const withinBudget = price < 40000;
    const anomalies = withinBudget ? [] : ['Price exceeds pre-approved budget'];
    return { brand, quantity, price, withinBudget, anomalies };
  },

  // Dashboard Stats
  getDashboardStats: async (_userId: string, _role: string): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      totalDonations: 1250000,
      totalProjects: 15,
      totalBeneficiaries: 3200,
      transparencyScore: 94,
      impactMetrics: {
        livesImpacted: 3200,
        projectsCompleted: 8,
        fundsUtilized: 1100000
      }
    };
  },

  // Beneficiary approvals
  submitBeneficiaryApproval: async (expenditureId: string, beneficiaryId: string, approved: boolean, _feedback: string): Promise<Expenditure> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = mockExpenditures.find(e => e.id === expenditureId);
    if (!existing) throw new Error('Expenditure not found');
    const approvals = existing.approvals ? [...existing.approvals] : [];
    const already = approvals.find(a => a.beneficiaryId === beneficiaryId);
    if (!already) approvals.push({ beneficiaryId, approved, timestamp: new Date() });
    const current = approvals.filter(a => a.approved).length;
    const required = existing.quorum?.required ?? 3;
    const achieved = current >= required;
    const status = achieved ? 'beneficiary_approved' : existing.status;
    return await api.updateExpenditure(expenditureId, { approvals, quorum: { required, current, achieved }, status });
  },

  // --- Project Updates (in-memory) ---
  addProjectUpdate: async (projectId: string, stage: string, percent: number, note?: string, transactionsNote?: string): Promise<ProjectUpdate> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const update: ProjectUpdate = {
      id: Date.now().toString(),
      projectId,
      stage,
      percent: Math.max(0, Math.min(100, Math.round(percent))),
      note,
      transactionsNote,
      createdAt: new Date(),
      approvals: []
    };
    projectUpdatesStore.unshift(update);
    return update;
  },

  getProjectUpdates: async (projectId?: string): Promise<ProjectUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return projectId ? projectUpdatesStore.filter(u => u.projectId === projectId) : [...projectUpdatesStore];
  },

  approveProjectUpdate: async (updateId: string, donorId: string, approved: boolean): Promise<ProjectUpdate> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = projectUpdatesStore.findIndex(u => u.id === updateId);
    if (idx < 0) throw new Error('Update not found');
    const u = projectUpdatesStore[idx];
    const others = (u.approvals || []).filter(a => a.donorId !== donorId);
    const updated: ProjectUpdate = { ...u, approvals: [{ donorId, approved, timestamp: new Date() }, ...others] };
    projectUpdatesStore[idx] = updated;
    return updated;
  },

  // Chatbot (EN/HI intent-based)
  sendChatMessage: async (message: string, language: string = 'en'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const text = (message || '').trim();
    const lower = text.toLowerCase();
    const isHindiInput = /[\u0900-\u097F]/.test(text);
    const lang = language === 'hi' || isHindiInput ? 'hi' : 'en';

    // Helpers
    const en = (s: string) => s;
    const hi = (s: string) => s;

    // Knowledge base (high-level FAQs)
    const KB = {
      whatIs: {
        en: en('Project Setu is a transparency-first funding platform that connects donors, NGOs, vendors, and beneficiaries. It records spending on-chain and verifies each step using a Triple‑Lock process.'),
        hi: hi('प्रोजेक्ट सेतु एक पारदर्शिता-केंद्रित फंडिंग प्लेटफ़ॉर्म है जो दानदाताओं, एनजीओ, वेंडर्स और लाभार्थियों को जोड़ता है। यह खर्च को ब्लॉकचेन पर दर्ज करता है और ट्रिपल‑लॉक प्रक्रिया से हर चरण की जांच करता है।')
      },
      howDonate: {
        en: en('Go to the Projects page, open a project, then click "Donate Now". You can pay via connected wallet or supported payment methods. The donation is tracked on-chain.'),
        hi: hi('प्रोजेक्ट्स पेज पर जाएँ, किसी प्रोजेक्ट को खोलें और "Donate Now" पर क्लिक करें। आप जुड़े हुए वॉलेट या सपोर्टेड पेमेंट तरीकों से भुगतान कर सकते हैं। दान ऑन‑चेन ट्रैक होता है।')
      },
      track: {
        en: en('Open Dashboard → see your donations and each expenditure. Every transaction appears on the public ledger and your dashboard in near real time.'),
        hi: hi('डैशबोर्ड खोलें → अपनी डोनेशन्स और प्रत्येक व्यय देखें। हर ट्रांज़ैक्शन पब्लिक लेजर और आपके डैशबोर्ड पर लगभग रियल‑टाइम में दिखता है।')
      },
      tripleLock: {
        en: en('Triple‑Lock = (1) Vendor Proof (photos + geo‑tag), (2) AI Verification (OCR/anomaly checks), (3) Beneficiary Confirmation (quorum). Funds move only when checks pass.'),
        hi: hi('ट्रिपल‑लॉक = (1) वेंडर प्रूफ (फोटो + जियो‑टैग), (2) एआई वेरिफिकेशन (ओसीआर/अनियमितता जाँच), (3) लाभार्थी पुष्टि (क्वोरम)। जांच पास होने पर ही फंड आगे बढ़ता है।')
      },
      fees: {
        en: en('Platform fees are minimal and shown transparently before you confirm the donation. Network fees may apply for on‑chain transactions.'),
        hi: hi('प्लेटफ़ॉर्म शुल्क न्यूनतम है और डोनेशन कन्फ़र्म करने से पहले पारदर्शी रूप से दिखाया जाता है। ऑन‑चेन ट्रांज़ैक्शन पर नेटवर्क शुल्क लग सकता है।')
      },
      security: {
        en: en('Security: on‑chain records, AI verification, beneficiary quorum, and audit trails. You control your wallet; we never store private keys.'),
        hi: hi('सुरक्षा: ऑन‑चेन रिकॉर्ड, एआई वेरिफिकेशन, लाभार्थी क्वोरम और ऑडिट ट्रेल्स। आपका वॉलेट आपके नियंत्रण में रहता है; हम कभी भी प्राइवेट कीज़ स्टोर नहीं करते।')
      },
      wallet: {
        en: en('Connect or disconnect your wallet from the header. Use it to donate and to view on‑chain confirmations linked to your account.'),
        hi: hi('हेडर से अपना वॉलेट कनेक्ट/डिस्कनेक्ट करें। इसका उपयोग डोनेट करने और अपने खाते से जुड़े ऑन‑चेन कन्फ़र्मेशन देखने के लिए करें।')
      },
      register: {
        en: en('Create an account via Register. Choose your role (donor, NGO, vendor, beneficiary) to access the right dashboard.'),
        hi: hi('रजिस्टर पेज से अकाउंट बनाएँ। अपनी भूमिका (डोनर, एनजीओ, वेंडर, लाभार्थी) चुनें ताकि सही डैशबोर्ड मिले।')
      },
      roles: {
        en: en('Roles: Donor funds projects; NGO manages projects/expenditures; Vendor fulfills and uploads proof; Beneficiary confirms delivery; Government/oversight can review transparency.'),
        hi: hi('भूमिकाएँ: डोनर फंड देता है; एनजीओ प्रोजेक्ट/व्यय मैनेज करता है; वेंडर सप्लाई कर प्रूफ अपलोड करता है; लाभार्थी डिलीवरी की पुष्टि करता है; सरकार/निगरानी पारदर्शिता की समीक्षा कर सकती है।')
      },
      ledger: {
        en: en('Public Ledger shows verified expenditures and deliveries that met the quorum. Check the Ledger page for community‑visible records.'),
        hi: hi('पब्लिक लेजर में वेरीफाइड व्यय और डिलीवरी दिखती हैं जो क्वोरम पूरी करती हैं। सामुदायिक दृश्य रिकॉर्ड के लिए लेजर पेज देखें।')
      },
      vendors: {
        en: en('Vendors receive NGO requests, complete work, and upload geo‑tagged proof. Payments are released after AI and beneficiary checks.'),
        hi: hi('वेंडर्स को एनजीओ से अनुरोध मिलते हैं, वे कार्य पूरा कर जियो‑टैग्ड प्रूफ अपलोड करते हैं। एआई और लाभार्थी जाँच के बाद भुगतान जारी होता है।')
      },
      contact: {
        en: en('Contact: email contact@projectsetu.org | Phone +91 98765 43210. Happy to help!'),
        hi: hi('संपर्क: email contact@projectsetu.org | फ़ोन +91 98765 43210. सहायता हेतु हम उपलब्ध हैं!')
      },
      refund: {
        en: en('Refunds depend on project status and policy. Write to support with your transaction ID; we will review transparently.'),
        hi: hi('रिफंड प्रोजेक्ट की स्थिति और नीति पर निर्भर करता है। अपना ट्रांज़ैक्शन आईडी भेजकर सपोर्ट से लिखें; हम पारदर्शी समीक्षा करेंगे।')
      }
    } as const;

    // Intent checks
    const is = {
      donate: /(donat|fund|give|pay|contribut)|दान|डोनेट/.test(lower),
      track: /(track|status|where.*(money|fund)|देख|ट्रैक)/.test(lower),
      triple: /(triple|lock|triple\s*-?\s*lock|तीन|ट्रिपल)/.test(lower),
      what: /(what\s+is|about|explain|overview|क्या|क्या|परिचय)/.test(lower),
      fees: /(fee|charges|cost|charge|फीस|शुल्क)/.test(lower),
      security: /(secure|security|safe|risk|सुरक्षा|सुरक्षित)/.test(lower),
      wallet: /(wallet|metamask|connect|disconnect|वॉलेट|जोड़)/.test(lower),
      register: /(register|sign\s*up|create\s*account|रजिस्टर|खाता)/.test(lower),
      roles: /(role|ngo|vendor|beneficiar|government|भूमिका|एनजीओ|वेंडर|लाभार्थी|सरकार)/.test(lower),
      ledger: /(ledger|public|transparen|लेजर|पब्लिक|पारदर्श)/.test(lower),
      vendors: /(vendor|supplier|proof|geo|वेंडर|प्रूफ|जियो)/.test(lower),
      contact: /(contact|email|support|help|फोन|संपर्क)/.test(lower),
      refund: /(refund|chargeback|cancel|रिफंड|वापसी)/.test(lower)
    };

    const pick = (entry: { en: string; hi: string }) => (lang === 'hi' ? entry.hi : entry.en);

    if (is.what) return pick(KB.whatIs);
    if (is.triple) return pick(KB.tripleLock);
    if (is.donate) return pick(KB.howDonate);
    if (is.track) return pick(KB.track);
    if (is.fees) return pick(KB.fees);
    if (is.security) return pick(KB.security);
    if (is.wallet) return pick(KB.wallet);
    if (is.register) return pick(KB.register);
    if (is.roles) return pick(KB.roles);
    if (is.ledger) return pick(KB.ledger);
    if (is.vendors) return pick(KB.vendors);
    if (is.contact) return pick(KB.contact);
    if (is.refund) return pick(KB.refund);

    const fallback = {
      en: en("I can help with Project Setu topics like donations, tracking, Triple‑Lock, roles, vendors, public ledger, security, fees, and support. What would you like to know?"),
      hi: hi('मैं प्रोजेक्ट सेतु से जुड़ी बातें जैसे डोनेशन, ट्रैकिंग, ट्रिपल‑लॉक, भूमिकाएँ, वेंडर्स, पब्लिक लेजर, सुरक्षा, फीस और सपोर्ट में मदद कर सकता/सकती हूँ। आप क्या जानना चाहेंगे?')
    };
    return lang === 'hi' ? fallback.hi : fallback.en;
  }
};

// Public data helpers
export async function getPublicLedger(): Promise<Expenditure[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockExpenditures.filter(e => e.status === 'beneficiary_approved' || e.status === 'completed');
}

// Reviews (in-memory mock)
const mockReviews: Review[] = [];
const vendorReviewStore: Array<{ id: string; vendorId: string; userId: string; userName: string; rating: number; comment: string; createdAt: Date }> = [];
const projectUpdatesStore: ProjectUpdate[] = [
  { id: 'u1', projectId: '1', stage: 'Planning', percent: 15, note: 'Survey completed; vendor shortlist created', transactionsNote: 'No transactions yet; planning phase', createdAt: new Date('2024-02-05'), approvals: [] },
  { id: 'u2', projectId: '1', stage: 'Procurement', percent: 35, note: 'Equipment ordered; delivery expected next week', transactionsNote: 'Advance paid to vendor1 for pumps', createdAt: new Date('2024-02-12'), approvals: [] },
  { id: 'u3', projectId: '2', stage: 'Construction', percent: 55, note: 'Foundation laid; walls up to 3ft', transactionsNote: 'Materials purchase and labor payouts ongoing', createdAt: new Date('2024-02-15'), approvals: [] }
];

export async function getProjectReviews(projectId: string): Promise<Review[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockReviews.filter(r => r.projectId === projectId);
}

export async function addProjectReview(projectId: string, userId: string, userName: string, rating: number, comment: string): Promise<Review> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const review: Review = {
    id: Date.now().toString(),
    projectId,
    userId,
    userName,
    rating,
    comment,
    createdAt: new Date()
  };
  mockReviews.unshift(review);
  return review;
}

export async function addVendorReview(vendorId: string, userId: string, userName: string, rating: number, comment: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const r = { id: Date.now().toString(), vendorId, userId, userName, rating, comment, createdAt: new Date() };
  vendorReviewStore.unshift(r);
  return r;
}

export async function getVendorReviews(vendorId: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return vendorReviewStore.filter(r => r.vendorId === vendorId);
}