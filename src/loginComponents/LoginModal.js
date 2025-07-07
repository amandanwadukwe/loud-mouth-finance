import { useState } from 'react';
import { useAuth } from './AuthContext';
import Modal from 'react-modal';
import '../styles/LoginModal.css'; 

export const LoginModal = ({ isOpen, onClose, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting with:", { email, password }); // Add this debug line
    
    try {
      const response = await fetch('https://amandanwadukwe.a2hosted.com/loud-mouth-finance/api/users/login', {
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
      className="login-modal"
      overlayClassName="modal-overlay"
    >
      <button className="close-button" onClick={onClose}>×</button>
      <h2 className="modal-title">Login to Your Account</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="submit-button" type="submit">Login</button>
        <button className="cancel-button" type="button" onClick={onClose}>
          Close
        </button>
        {switchToRegister && (
          <p className="register-prompt">
            Don't have an account?{' '}
            <button className="register-link" type="button" onClick={switchToRegister}>
              Register
            </button>
          </p>
        )}
      </form>
    </Modal>
  );
};