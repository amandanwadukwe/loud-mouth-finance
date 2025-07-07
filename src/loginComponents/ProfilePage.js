import { useAuth } from './AuthContext';
import '../styles/ProfilePage.css'; // Import your CSS styles
export const ProfilePage = () => {
  const { logout } = useAuth();

const user = JSON.parse(localStorage.getItem('user'));

  // Generate random pastel color based on user's name
  const getPastelColor = (str) => {
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="profile-container">
      <div 
        className="profile-icon"
        style={{ 
          backgroundColor: getPastelColor(user.name),
        }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="profile-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>Current Plan: {user.planId || 'Free'}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};