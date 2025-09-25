import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { account, connected, connect, disconnect } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnect();
    navigate('/');
  };

  const handleWalletToggle = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Project Setu</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
              Projects
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={handleWalletToggle}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    connected 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>
                    {connected 
                      ? `${account?.slice(0, 6)}...${account?.slice(-4)}` 
                      : 'Connect Wallet'
                    }
                  </span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;