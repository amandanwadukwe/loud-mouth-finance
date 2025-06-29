import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import api from './api';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const [status, setStatus] = useState('processing');
  const [planDetails, setPlanDetails] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updatePlan } = useAuth();

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (status === 'processing') {
        setStatus('error');
        setError('Payment verification timed out. Please check your account status.');
      }
    }, 15000); // 15 seconds timeout

    const processPayment = async () => {
      try {
        // Get query parameters
        const queryParams = new URLSearchParams(location.search);
        const planId = queryParams.get('plan');
        const sessionId = queryParams.get('session_id');
        
        console.log("Processing payment:", { planId, sessionId }); // Debug log
        
        if (!planId || !sessionId) {
          setStatus('error');
          setError(`Missing payment information: ${!planId ? 'Plan ID' : 'Session ID'} not provided`);
          toast.error('Missing payment information in URL');
          return;
        }

        // Check for JWT token
        const token = localStorage.getItem('jwt');
        if (!token) {
          setStatus('error');
          setError('Authentication token missing. Please log in again.');
          toast.error('You need to be logged in');
          setTimeout(() => navigate('/plans'), 3000);
          return;
        }

        // Make API call to verify payment and update user plan
        console.log("Sending verification request to API");
        const response = await api.post('/payments/verify', {
          planId,
          sessionId
        }, {
          headers: {
            'x-auth-token': token
          }
        });
        
        console.log("Payment verification response:", response.data); // Debug log
        
        // Update local user state
        try {
          await updatePlan(planId);
          console.log("Local user state updated with new plan:", planId);
        } catch (updateError) {
          console.error("Error updating local plan:", updateError);
          // Continue with the success flow even if local state update fails
          // The server-side update is what matters most
        }
        
        // Update component state
        setPlanDetails({
          planId,
          name: planId.charAt(0).toUpperCase() + planId.slice(1),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
        
        setStatus('success');
        toast.success('Your subscription has been activated!');
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        
        // Detailed error logging
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response status:", error.response.status);
          setError(`Server error: ${error.response.data.error || error.response.statusText}`);
        } else if (error.request) {
          console.error("Request error:", error.request);
          setError('No response received from server. Please check your connection.');
        } else {
          console.error("Error message:", error.message);
          setError(`Error: ${error.message}`);
        }
        
        toast.error(error.response?.data?.error || 'Failed to verify payment');
      }
    };

    if (user) {
      processPayment();
    } else {
      console.log("No user found in context, checking localStorage");
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'null') {
        console.log("User found in localStorage, proceeding with payment verification");
        processPayment();
      } else {
        console.error("No user data available");
        setStatus('error');
        setError('You must be logged in to complete this process');
        toast.error('You must be logged in');
        setTimeout(() => navigate('/plans'), 3000);
      }
    }

    // Clear timeout on component unmount or when status changes
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [location, navigate, user, updatePlan, status]);

  if (status === 'processing') {
    return (
      <div className="payment-success-container processing">
        <div className="payment-card">
          <div className="spinner"></div>
          <h1>Processing Your Payment</h1>
          <p>Please wait while we confirm your subscription...</p>
          <p className="processing-note">This may take a few moments. Please do not refresh the page.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-success-container error">
        <div className="payment-card">
          <div className="error-icon">❌</div>
          <h1>Payment Processing Error</h1>
          <p>We couldn't verify your payment. Please contact support or try again.</p>
          {error && <p className="error-details">{error}</p>}
          <div className="button-group">
            <button onClick={() => navigate('/plans')} className="back-button">
              Return to Plans
            </button>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="payment-card">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your subscription to our {planDetails?.name} plan.</p>
        
        {planDetails && (
          <div className="plan-details">
            <h2>Subscription Details</h2>
            <div className="detail-row">
              <span>Plan:</span>
              <span>{planDetails.name}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span>Active</span>
            </div>
            <div className="detail-row">
              <span>Next Billing Date:</span>
              <span>{planDetails.nextBillingDate}</span>
            </div>
          </div>
        )}
        
        <div className="button-group">
          <button onClick={() => navigate('/profile')} className="primary-button">
            View My Subscription
          </button>
          <button onClick={() => navigate('/planner')} className="secondary-button">
            Go to Financial Planner
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;