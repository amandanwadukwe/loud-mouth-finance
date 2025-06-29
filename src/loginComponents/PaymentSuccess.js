import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import api from './api';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const [status, setStatus] = useState('processing');
  const [planDetails, setPlanDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updatePlan } = useAuth();

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get query parameters
        const queryParams = new URLSearchParams(location.search);
        const planId = queryParams.get('plan');
        const sessionId = queryParams.get('session_id');
        
        if (!planId) {
          setStatus('error');
          toast.error('Missing plan information');
          setTimeout(() => navigate('/plans'), 3000);
          return;
        }

        // Make API call to verify payment and update user plan
        const { data } = await api.post('/api/payments/verify', {
          planId,
          sessionId
        }, {
          headers: {
            'x-auth-token': localStorage.getItem('jwt')
          }
        });
        
        // Update local user state
        await updatePlan(planId);
        
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
        toast.error(error.response?.data?.error || 'Failed to verify payment');
      }
    };

    if (user) {
      processPayment();
    } else {
      setStatus('error');
      toast.error('You must be logged in');
      navigate('/');
    }
  }, [location, navigate, user, updatePlan]);

  if (status === 'processing') {
    return (
      <div className="payment-success-container processing">
        <div className="payment-card">
          <div className="spinner"></div>
          <h1>Processing Your Payment</h1>
          <p>Please wait while we confirm your subscription...</p>
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
          <button onClick={() => navigate('/plans')} className="back-button">
            Return to Plans
          </button>
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