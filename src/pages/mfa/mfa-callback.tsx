
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import API from "../api/api"; // Adjust to your Axios instance

const MFACallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        let active = true;

        const verifySession = async () => {
            const status = searchParams.get("status");
            const user = searchParams.get("user");

            if (status !== "success") {
                message.error("MFA verification failed.");
                navigate("/login", { replace: true });
                return;
            }

            if (!user) {
                message.error("Unable to identify user!");
                navigate("/login", { replace: true });
                return;
            }

            try {
                // Verify the actual HttpOnly cookie
                const response = await API.get(
                    "/auth/verify_token",
                    { withCredentials: true }
                );

                if (!active) return;

                if (
                    response.data.authenticated &&
                    response.data.user === user
                ) {
                    localStorage.setItem("user", user);

                    message.success("MFA verification successful.");

                    navigate("/home-redirect", {
                        replace: true
                    });
                } else {
                    message.error("Session verification failed.");
                    navigate("/login", { replace: true });
                }

            } catch (error) {
                if (!active) return;

                console.error("Session verification error:", error);

                message.error(
                    "Unable to verify your session. Please try logging in again."
                );

                navigate("/login", { replace: true });
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
