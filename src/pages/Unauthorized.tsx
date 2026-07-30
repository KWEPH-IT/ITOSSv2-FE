import { Button, Result } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: 24,
      }}
    >
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you don't have permission to access this page."
        extra={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>,
          <Button
            key="home"
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>,
        ]}
      />
    </div>
  );
};

export default UnauthorizedPage;