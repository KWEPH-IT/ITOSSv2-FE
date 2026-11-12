import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const MFACallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { setUserId } = useAuth();

    useEffect(() => {
        let active = true;

        const verifySession = async () => {
            const status = searchParams.get("status");
            const user = searchParams.get("user");

            if (status !== "success" || !user) {
                navigate("/", { replace: true });
                return;
            }

            try {
                const response = await API.get(
                    "/auth/verify_token",
                    { withCredentials: true }
                );

                if (!active) return;

                if (
                    response.data.authenticated === true &&
                    String(response.data.emp_id) === String(user)
                ) {
                    // Update localStorage
                    localStorage.setItem("user", user);

                    // IMPORTANT: Update React AuthContext
                    setUserId(user);

                    message.success("MFA verification successful.");

                    navigate("/home-redirect", {
                        replace: true
                    });

                } else {
                    message.error("Session verification failed.");
                    navigate("/", { replace: true });
                }

            } catch (error) {
                if (!active) return;

                console.error("MFA verification error:", error);

                message.error("Unable to verify your session.");

                navigate("/", { replace: true });
            }
        };

        verifySession();

        return () => {
            active = false;
        };

    }, [searchParams, navigate, setUserId]);

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
