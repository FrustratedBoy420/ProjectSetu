import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, aadhaar?: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string; aadhaar?: string; ngoRegNumber?: string; ngoDocAuth?: number }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Dummy datasets for verification
  const allowedAadhaar = new Set<string>([
    '1234-5678-9012',
    '1111-2222-3333',
    '9999-8888-7777'
  ]);
  const allowedNgoRegs = new Set<string>([
    'NGO-REG-001',
    'NGO-REG-XYZ',
    'NGO-REG-123'
  ]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('setu_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, aadhaar?: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Aadhaar verification required for login (demo)
      if (!aadhaar || !allowedAadhaar.has(aadhaar)) {
        throw new Error('Aadhaar verification failed');
      }

      // Mock user data based on email
      const mockUser: User = {
        id: '1',
        email,
        name: email.includes('donor') ? 'John Donor' :
          email.includes('ngo') ? 'NGO Manager' :
            email.includes('beneficiary') ? 'Jane Beneficiary' :
              email.includes('vendor') ? 'Vendor Corp' : 'Government Official',
        role: email.includes('donor') ? 'donor' :
          email.includes('ngo') ? 'ngo' :
            email.includes('beneficiary') ? 'beneficiary' :
              email.includes('vendor') ? 'vendor' : 'government',
        verified: true,
        createdAt: new Date(),
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96DfbF3b87'
      };

      setUser(mockUser);
      localStorage.setItem('setu_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string; aadhaar?: string; ngoRegNumber?: string; ngoDocAuth?: number }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simple rules: require Aadhaar for all; NGO must pass NGO reg check (and optional doc auth threshold)
      if (!userData.aadhaar || !allowedAadhaar.has(userData.aadhaar)) {
        throw new Error('Aadhaar verification failed');
      }
      if (userData.role === 'ngo') {
        if (!userData.ngoRegNumber || !allowedNgoRegs.has(userData.ngoRegNumber)) {
          throw new Error('NGO verification failed');
        }
        if (typeof userData.ngoDocAuth === 'number' && userData.ngoDocAuth < 0.85) {
          throw new Error('NGO document authenticity too low');
        }
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
        verified: true,
        createdAt: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('setu_user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('setu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};