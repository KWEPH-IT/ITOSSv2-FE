import MainLayout from "./MainLayout";
import { getUserData } from "../hooks/user_hooks";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const Home = () => {
  const { userId }  = useAuth();
   const { userData, loading } = getUserData(userId);

   if (!userId) {
     return <p>User not logged in. Redirect to login.</p>;
   }
   
   if (loading) return <p>Loading...</p>;
   if (!userData) return <p>No user data found.</p>;

  return (
    <MainLayout title="Dashboard">
      <div className="welcome-container">
        <h2>Welcome, {userData.EmployeeName}!</h2>
        <p>Email: {userData.EmailAddress}</p>
      </div>
    </MainLayout>
  );
  
};

export default Home;
