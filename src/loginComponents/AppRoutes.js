import { Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { ProfilePage } from './ProfilePage';
import PlansPage from './PlansPage';
import PaymentSuccess from './PaymentSuccess';
import ProtectedRoute from './ProtectedRoute';    
import { Main } from '../components/Main';
import SavingsSeries from '../components/SavingsSeries';
import FinancialPlanner from '../components/FinancialPlanner';
import BankStatementUploader from '../components/BankStatementUploader';

const AppRoutes = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<HomePage />}> */}
        <Route index element={<HomePage />} />
        <Route path="/profile" element={
            <ProfilePage />
        } />
        <Route path="/plans" element={
            <PlansPage />
        } />
        <Route path="/savings" element={
            <SavingsSeries />
        } />
        <Route path="/planner" element={
            <ProtectedRoute><FinancialPlanner /></ProtectedRoute> 
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/home" element={<Main />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/statement" element={<BankStatementUploader />} />


        <Route path="/payment-success" element={
  <ProtectedRoute>
    <PaymentSuccess />
  </ProtectedRoute>
} />
      {/* </Route> */}
      
        
    </Routes>
  );
};

export default AppRoutes;