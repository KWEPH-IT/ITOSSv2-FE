
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import API from "../../api/api";

const API_URL = import.meta.env.VITE_SERVER_API_URL;

const MFACallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        let active = true;

        const verifySession = async () => {
            const status = searchParams.get("status");
            const user = searchParams.get("user");

            if (status !== "success" || !user) {
                message.error("MFA verification failed.");
                navigate("/", { replace: true });
                return;
            }

            try {
                const response = await API.get(
                    `${API_URL}/auth/verify_token`,
                    { withCredentials: true }
                );

                if (!active) return;

                const authenticated =
                    response.data.authenticated === true &&
                    String(response.data.emp_id) === String(user);

                if (!authenticated) {
                    message.error("Session verification failed.");
                    navigate("/", { replace: true });
                    return;
                }

                localStorage.setItem("user", user);

                message.success("MFA verification successful.");

                navigate("/home-redirect", {
                    replace: true
                });

            } catch (error: any) {
                if (!active) return;

                console.error(
                    "MFA session verification failed:",
                    error.response?.data || error
                );

                message.error(
                    "Unable to verify your session. Please log in again."
                );

                navigate("/", { replace: true });
            }
        };

        verifySession();

        return () => {
            active = false;
        };

    }, [searchParams, navigate]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
        }}>
            <Spin size="large" />
        </div>
    );
};

export default MFACallback;
