import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Spin } from "antd";
import { handleLoggedAction } from "../../utils/Logger";

const MFACallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const status = searchParams.get("status");
        const user = searchParams.get("user");

        if (status === "success") {

            if (!user) {
                message.error("Unable to identify user!");
                navigate("/");
                return;
            }

            localStorage.setItem("user", user);
            console.log(user)

            message.success("MFA verification successful.");

            handleLoggedAction(
                user,
                "LOGIN SUCCESS",
                ""
            );

            navigate("/home-redirect", { replace: true });

        } else {
            message.error("MFA verification failed.");

            navigate("/login", { replace: true });
        }

    }, [searchParams, navigate]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}
        >
            <Spin size="large" />
        </div>
    );
};

export default MFACallback;

