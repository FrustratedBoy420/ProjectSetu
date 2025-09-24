import { Project, Transaction, Expenditure, Beneficiary, DashboardStats } from '../types';

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

  // Transactions
  createTransaction: async (projectId: string, amount: number): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Date.now().toString(),
      projectId,
      donorId: 'donor1',
      amount,
      currency: 'INR',
      blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'completed',
      createdAt: new Date()
    };
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
    return { ...existing!, ...updates };
  },

  // AI Verification
  verifyDocument: async (file: File): Promise<any> => {
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

  // Dashboard Stats
  getDashboardStats: async (userId: string, role: string): Promise<DashboardStats> => {
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

  // Chatbot
  sendChatMessage: async (message: string, language: string = 'en'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      'how to donate': 'To make a donation, go to the Projects page, select a project you want to support, and click "Donate Now". You can pay using your connected wallet or traditional payment methods.',
      'track donation': 'You can track your donations in real-time through your dashboard. Every transaction is recorded on the blockchain for complete transparency.',
      'triple lock': 'The Triple-Lock system ensures your donation reaches beneficiaries through three verification steps: vendor proof, AI verification, and beneficiary confirmation.',
      'default': 'I\'m here to help you with Project Setu! You can ask me about donations, tracking funds, the Triple-Lock system, or any other questions about our platform.'
    };

    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('donate')) return responses['how to donate'];
    if (lowerMessage.includes('track')) return responses['track donation'];
    if (lowerMessage.includes('triple') || lowerMessage.includes('lock')) return responses['triple lock'];
    
    return responses['default'];
  }
};