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
            <h2>Tech-Driven Support for Smarter Money Moves</h2>
            <p>
            We don’t offer advice, we offer powerful tools to help you make confident financial decisions, your way.
            </p>
            <p>
            Independent | Insightful | Built for You
            </p>
          </div>
        </footer>
        </AuthProvider>
      </Router>
    
  );
}

export default App;