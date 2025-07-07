import { useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import '../styles/PlansPage.css'; // Assuming you have a CSS file for styling

const PlansPage = () => {
  const { getPaymentLink, openLoginModal } = useAuth();
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || null;
  
  const handleUpgrade = async (planId) => {
    setLoading(true);
    
    // Check for JWT token directly
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      // Store the plan ID before opening login modal
      localStorage.setItem('pendingPlanUpgrade', planId);
      toast.info('Please log in to upgrade your plan');
      openLoginModal(); // Open the login modal
      setLoading(false);
      return;
    }
    
    try {
      const paymentLink = await getPaymentLink(planId);
      if (paymentLink) {
        window.location.href = paymentLink;
      }
      console.log('Payment link:', paymentLink);
      toast.success('Redirecting to payment page...');
    } catch (error) {
      console.error('Error initiating payment:', error);
      
      // Check for auth errors in the response
      if (error.response?.status === 401 || 
          error.message?.includes('token') || 
          error.message?.includes('authorization')) {
        // Store the plan ID before opening login modal
        localStorage.setItem('pendingPlanUpgrade', planId);
        toast.info('Your session has expired. Please log in again.');
        openLoginModal(); // Open the login modal
      } else {
        toast.error('Failed to initiate payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const PLANS = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99/month',
      features: ['Feature 1', 'Feature 2'],
      current: user?.planId === 'basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99/month',
      features: ['All Basic features', 'Feature 3', 'Feature 4'],
      current: user?.planId === 'premium'
    }
  ];

  return (
    <div className="plans-container">
      <h1>Choose Your Plan</h1>
      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.current ? 'current-plan' : ''}`}>
            <h3>{plan.name}</h3>
            <p className="price">{plan.price}</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.current || loading}
              className={loading ? 'loading' : ''}
            >
              {loading ? 'Processing...' : plan.current ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;