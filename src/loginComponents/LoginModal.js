import { useState } from 'react';
import { useAuth } from './AuthContext';
import Modal from 'react-modal';

export const LoginModal = ({ isOpen, onClose, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting with:", { email, password }); // Add this debug line
    
    try {
      const response = await fetch('https://wonderful-speculoos-c86402.netlify.app/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      
      const data = await response.json();
      console.log("Server response:", data); // Add this debug line
      
      if (response.ok) {
        login({ email, password });
        console.log("Login successful:", data); // Add this debug line
        onClose();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: Network error');
    }
  };
  
  return (
    <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    contentLabel="Login Modal"
  >
      <h2>Login to Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <button type="button" onClick={onClose}>
          Close
        </button>
        {switchToRegister && (
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={switchToRegister}>
              Register
            </button>
          </p>
        )}
      </form>
    </Modal>
  );
};