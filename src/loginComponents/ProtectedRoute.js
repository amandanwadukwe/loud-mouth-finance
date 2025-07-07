import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

// Plan hierarchy: free (default) -> basic -> premium
const PLAN_LEVELS = {
  free: 0,
  basic: 1,
  premium: 2
};

const ProtectedRoute = ({ children, requiredPlan = 'free' }) => {
  const { user, openLoginModal } = useAuth();
  
  // Get user plan from localStorage as fallback
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const userPlanId = user?.planId || storedUser.planId || 'free';

  // Helper function to check if user's plan meets the required level
  const hasRequiredPlanAccess = () => {
    // If no user, definitely no access
    if (!user && !storedUser) return false;
    
    // Get user's plan level (default to free if not set)
    const userPlanLevel = PLAN_LEVELS[userPlanId] || 0;
    
    // Get required plan level (default to free if invalid plan provided)
    const requiredPlanLevel = PLAN_LEVELS[requiredPlan] || 0;
    
    // Debug logging to help identify issues
    console.log(`User plan: ${userPlanId} (level ${userPlanLevel}), Required: ${requiredPlan} (level ${requiredPlanLevel})`);
    
    // Check if user's plan level is sufficient
    return userPlanLevel >= requiredPlanLevel;
  };

  useEffect(() => {
    // First check if user is logged in
    if (!user && !storedUser) {
      openLoginModal();
      toast.info('Please log in to access this feature');
      return;
    }
    
    // Then check if they have the required plan level
    if (!hasRequiredPlanAccess()) {
      toast.warning(`This feature requires a ${requiredPlan} plan. Please upgrade to continue.`);
    }
  }, [user, openLoginModal, requiredPlan]);

  // If not logged in, navigate to plans
  if (!user && !storedUser) {
    return <Navigate to="/plans" replace />;
  }

  // If insufficient plan, navigate to plans page
  if (!hasRequiredPlanAccess()) {
    return <Navigate 
      to="/plans" 
      state={{ from: window.location.pathname, needsUpgrade: true, requiredPlan }}
      replace 
    />;
  }

  return children;
};

export default ProtectedRoute;