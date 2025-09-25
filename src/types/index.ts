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
  approvals?: { beneficiaryId: string; approved: boolean; timestamp: Date }[];
  quorum?: { required: number; current: number; achieved: boolean };
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

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
}

export interface VendorAssignment {
  expenditureId: string;
  vendorId: string;
}

export interface Review {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  stage: string; // e.g., Planning, Procurement, In Progress, Completed
  percent: number; // 0-100
  note?: string;
  transactionsNote?: string; // NGO note describing related transactions/expenditures
  createdAt: Date;
  approvals: { donorId: string; approved: boolean; timestamp: Date }[];
}