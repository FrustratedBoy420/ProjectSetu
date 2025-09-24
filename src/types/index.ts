export interface User {
  id: string;
  email: string;
  name: string;
  role: 'donor' | 'ngo' | 'beneficiary' | 'vendor' | 'government';
  walletAddress?: string;
  profileImage?: string;
  verified: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  ngoId: string;
  ngoName: string;
  beneficiaryCount: number;
  category: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'active' | 'completed' | 'paused';
  images: string[];
  createdAt: Date;
  endDate: Date;
}

export interface Transaction {
  id: string;
  projectId: string;
  donorId: string;
  amount: number;
  currency: string;
  blockchainHash: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Expenditure {
  id: string;
  projectId: string;
  vendorId: string;
  amount: number;
  description: string;
  category: string;
  status: 'pending' | 'vendor_submitted' | 'ai_verified' | 'beneficiary_approved' | 'completed' | 'rejected';
  vendorProof?: {
    images: string[];
    location: [number, number];
    timestamp: Date;
    description: string;
  };
  aiVerification?: {
    ocrResults: any;
    authenticity: number;
    anomalies: string[];
    verified: boolean;
    timestamp: Date;
  };
  beneficiaryApproval?: {
    beneficiaryId: string;
    approved: boolean;
    feedback: string;
    timestamp: Date;
  };
  createdAt: Date;
}

export interface Beneficiary {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  identityVerified: boolean;
  projectIds: string[];
  totalReceived: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  language: string;
}

export interface DashboardStats {
  totalDonations: number;
  totalProjects: number;
  totalBeneficiaries: number;
  transparencyScore: number;
  impactMetrics: {
    livesImpacted: number;
    projectsCompleted: number;
    fundsUtilized: number;
  };
}