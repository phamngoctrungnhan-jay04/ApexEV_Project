import { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isCustomer: user?.role === USER_ROLES.CUSTOMER,
    isTechnician: user?.role === USER_ROLES.TECHNICIAN,
    isAdvisor: user?.role === USER_ROLES.ADVISOR,
    isManager: user?.role === USER_ROLES.MANAGER,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
