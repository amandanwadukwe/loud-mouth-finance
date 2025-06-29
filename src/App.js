import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './loginComponents/AuthContext';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './loginComponents/AppRoutes';
import { Header } from './loginComponents/Header';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
      <Router>
            <AuthProvider>
        <Header />
        
        <ToastContainer position="bottom-right" />
        <AppRoutes />
        <footer>
          <div className="main-div">
            <h2>Your Trusted Financial Advisor</h2>
            <p>
              Guiding you with expert advice tailored to your unique financial goals. Secure, reliable, and designed for the modern investor.
            </p>
            <p>
              Trusted Guidance | Clear Insights | Modern Expertise
            </p>
          </div>
        </footer>
        </AuthProvider>
      </Router>
    
  );
}

export default App;