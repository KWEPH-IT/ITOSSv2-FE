import { Row, Col, Card, Typography, Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../services/authLogin";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import { memo, useState } from "react";
import { Loader } from "../components/Loader";

const { Title } = Typography;



const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserId } = useAuth();

  const onSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    await handleLogin(values, navigate, setUserId);
    setLoading(false);
  };
  if (loading) return <Loader />;

  
  
  return (
    <div className="login">
      <div style={{ padding: 20 }} className="blue-gradient">
        <Row>
          <Col xl={12} lg={12} md={12} sm={12} xs={24}>
            <div className="logo-container">
              <img
                src="images/kwe_logo_header2.png"
                className="kwelogo"
                alt="KWE Logo"
              />
            </div>
          </Col>
          <Col xl={12} lg={12} md={12} sm={12} xs={24}>
            <div className="logo-container">
              <img
                src="images/logo.png"
                className="systemlogo"
                alt="ITOSS Logo"
              />
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ maxWidth: 300, margin: "100px auto" }}>
        <div className="login-container"><FormHelper onSubmit={onSubmit} loading={loading}/></div>
      </div>
    </div>
  );
};


const FormHelper = memo(({onSubmit, loading}:any) => {
    return (
      <Card className="login-card" bordered={false}>
        <Title level={5} className="login-title">
          Login
        </Title>
        <Form name="login" onFinish={onSubmit}>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Please enter your Employee ID!" },
            ]}
          >
            <div className="input-container">
              <div className="icon-box">
                <UserOutlined className="input-icon" />
              </div>
              <Input className="custom-input" placeholder="Employee ID" />
            </div>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <div className="input-container">
              <div className="icon-box">
                <LockOutlined className="input-icon" />
              </div>
              <Input.Password className="custom-input" placeholder="Password" />
            </div>
          </Form.Item>

          <Form.Item>
            <div className="button-container">
              <Button
                className="login-button"
                htmlType="submit"
                loading={loading}
              >
                LOG IN
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    );
  });

export default Login;
