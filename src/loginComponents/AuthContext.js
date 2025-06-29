import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from './api';

// Payment links for different plan tiers
const PAYMENT_LINKS = {
  basic: 'https://buy.stripe.com/3cI6oHarEg7t6Rm6Me9bO05',
  premium: 'https://buy.stripe.com/aFadR98jw8F10sY3A29bO06',
  enterprise: 'https://buy.stripe.com/test_enterprise_plan_link'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (err) {
          localStorage.removeItem('jwt');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const register = async (formData) => {
    try {
      const { data } = await api.post('/users/register', formData);
      localStorage.setItem('jwt', data.token);
      setUser(data.user);
      toast.success('Registration successful!');
      
      // Check if there was a pending plan upgrade
      const pendingPlanId = localStorage.getItem('pendingPlanUpgrade');
      if (pendingPlanId) {
        localStorage.removeItem('pendingPlanUpgrade');
        window.location.href = PAYMENT_LINKS[pendingPlanId] || '/plans';
      } else {
        closeLoginModal();
      }
      
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const login = async (formData) => {
    console.log("Login form data:", formData);
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return false;
    }
    
    try {
      const { data } = await api.post('http://localhost:5000/api/users/login', formData);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Login successful!');
      closeLoginModal();
      
      // Check if there's a pending plan upgrade
      const pendingPlanId = localStorage.getItem('pendingPlanUpgrade');
      if (pendingPlanId) {
        // Clear the pending plan ID
        localStorage.removeItem('pendingPlanUpgrade');
        
        // Direct redirect to payment link without API call
        if (PAYMENT_LINKS[pendingPlanId]) {
          window.location.href = PAYMENT_LINKS[pendingPlanId];
        } else {
          toast.error('Invalid plan selected');
        }
      }
      
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.setItem('user', null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updatePlan = async (planId) => {
    try {
      const { data } = await api.put('/users/plan', { planId });
      setUser(prev => ({ ...prev, planId: data.planId }));
      toast.success('Plan updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Plan update failed');
      return false;
    }
  };

  const getPaymentLink = async (planId) => {
    // Check if user is authenticated
    const token = localStorage.getItem('jwt');
    if (!token) {
      // Store the plan ID for after login
      localStorage.setItem('pendingPlanUpgrade', planId);
      openLoginModal();
      return null;
    }
    
    // For direct links without API call:
    if (PAYMENT_LINKS[planId]) {
      return PAYMENT_LINKS[planId];
    }
    
    // Fallback to API if needed:
    try {
      const { data } = await api.post('/payments/link', { planId }, {
        headers: {
          'x-auth-token': token
        }
      });
      
      return data.paymentLink;
    } catch (err) {
      if (err.response?.status === 401) {
        // Store the plan ID before opening login modal
        localStorage.setItem('pendingPlanUpgrade', planId);
        // Open login modal on authentication error
        openLoginModal();
      }
      toast.error(err.response?.data?.error || 'Could not generate payment link');
      return null;
    }
  };

  // Login modal control functions
  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout, 
      updatePlan,
      getPaymentLink,
      showLoginModal,
      openLoginModal,
      closeLoginModal,
      paymentLinks: PAYMENT_LINKS // Export payment links if needed elsewhere
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);