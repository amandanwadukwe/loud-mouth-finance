import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, openLoginModal } = useAuth();

  useEffect(() => {
    if (!user) {
      // Open login modal directly
      openLoginModal();
      toast.info('Please log in to access this premium feature');
    }
  }, [user, openLoginModal]);

  if (!user) {
    return <Navigate to="/plans" replace />;
  }

  return children;
};

export default ProtectedRoute;