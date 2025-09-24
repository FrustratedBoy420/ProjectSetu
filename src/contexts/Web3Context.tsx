import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Web3ContextType {
  account: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (to: string, amount: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if already connected
    const savedAccount = localStorage.getItem('setu_wallet');
    if (savedAccount) {
      setAccount(savedAccount);
      setConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      // Simulate wallet connection
      const mockAccount = '0x742d35Cc6634C0532925a3b8D4C9db96DfbF3b87';
      setAccount(mockAccount);
      setConnected(true);
      localStorage.setItem('setu_wallet', mockAccount);
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setConnected(false);
    localStorage.removeItem('setu_wallet');
  };

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  };

  return (
    <Web3Context.Provider value={{ account, connected, connect, disconnect, sendTransaction }}>
      {children}
    </Web3Context.Provider>
  );
};