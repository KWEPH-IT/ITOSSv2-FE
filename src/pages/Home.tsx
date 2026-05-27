import MainLayout from "./MainLayout";
import { getUserData } from "../hooks/user_hooks";
import { useAuth } from "../context/AuthContext";



const Home = () => {
  const { userId }  = useAuth();
   // Prevent API calls if userId is null
   const { userData, loading } = getUserData(userId);

   if (!userId) {
     return <p>User not logged in. Redirect to login.</p>;
   }
   
   if (loading) return <p>Loading...</p>;
   if (!userData) return <p>No user data found.</p>;

  return (
    <MainLayout title="Dashboard">
      <h2>Welcome, {userData.FullName}!</h2>
      <p>Department: {userData.Department}</p>
    </MainLayout>
  );
  
};

export default Home;
