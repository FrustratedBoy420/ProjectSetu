import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
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

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('setu_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const register = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
        verified: false,
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