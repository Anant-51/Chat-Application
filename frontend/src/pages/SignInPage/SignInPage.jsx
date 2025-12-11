import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import useCentralStore from "../../centralStore.jsx";
import styles from "./SignInPage.module.css";

const url = import.meta.env.VITE_BACKEND_URL;

const SignInPage = () => {
  const [result, setResult] = useState("");
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const setUser = useCentralStore((state) => state.setUser);
  const setSocket = useCentralStore((state) => state.setSocket);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    const res = await fetch(`${url}/api/user/signin`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    console.log("responseData", responseData);
    setResult(responseData);

    if (!res.ok) {
      setVisible(true);
      return;
    }

    const socket = io(`${url}`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    console.log("socket", socket);

    setSocket(socket);
    setUser(responseData.user);
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      navigate("/main");
    });
  };

  return (
    <div className={styles.container}>
      {/* Left Side */}
      <div className={styles.leftSection}>
        <div>
          <h1 className={styles.appName}>Convy...</h1>
          <p className={styles.tagLine}>Enjoy the conversation</p>
        </div>
      </div>

      {/* Right Side */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          {visible && <div className={styles.errorBox}>{result.message}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Email ID"
                {...register("email", {
                  required: "Email Id is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={styles.input}
              />
              {errors.emailID && (
                <p className={styles.errorText}>{errors.emailID.message}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password should be at least 6 characters",
                  },
                })}
                className={styles.input}
              />
              {errors.password && (
                <p className={styles.errorText}>{errors.password.message}</p>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              Log In
            </button>
          </form>

          <div className={styles.divider}></div>

          <Link to="/signup" className={styles.createAccountButton}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
