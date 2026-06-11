import { Layout, Breadcrumb } from "antd";
import AppHeader from "./Header";
import Sidebar from "./Sidebar"; // Import Sidebar
import React from "react";
import { useState } from "react";
import { getUserData } from "../hooks/user_hooks";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";
import { Loader } from "../components/Loader";
import { useLocation } from "react-router-dom";

const {  Content, Footer } = Layout;

interface MainLayoutProps {
  title: ReactNode,
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({title, children}) => {
  const currentYear = new Date().getFullYear();
  const [collapsed, setCollapsed] = useState(false)
  const { userId }  = useAuth();
  const location = useLocation();

  // Prevent API calls if userId is null
  const { userData, loading } = getUserData(userId);

   if (!userId) {
     return <p>User not logged in. Redirect to login.</p>;
   }
   
   if (loading) return <Loader></Loader>;
   if (!userData) return <p>No user data found.</p>;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar stays on the left */}
      { userData.Department == 'IT' ?  <Sidebar collapsed={collapsed} /> : null }
     

      {/* Right side contains Header + Content + Footer */}
      <Layout >

      <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} userId={userId} userName={userData.FullName} dept={userData.Department} userGroup={userData.UserGroup}/>
      <Content style={ userData.Department === 'IT'? { padding: "0 24px 24px" } : undefined}>
        {userData.Department === 'IT' && (
          <Breadcrumb
            style={{ margin: "30px 0", fontSize: "14px", letterSpacing: "0.7px" }}
            items={[
              { title: "Home" },
              { title: title }
            ]}
          />
        )}

      <div
        style={
          userData.Department === 'IT' && (location.pathname != "/it-home" && !location.pathname.includes("/ticket"))
            ? { padding: 24, minHeight: 600, background: "#fff" }
            : undefined
        }
      >
        {children} {/* ✅ ALWAYS render children */}
      </div>
      </Content>
     
      
        

        <Footer style={{ textAlign: "center" }}>
          © {currentYear} KINTETSU WORLD EXPRESS (PHILIPPINES) INC.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;