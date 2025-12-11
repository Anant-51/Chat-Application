import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import useCentralStore from "../../centralStore.jsx";
import styles from "./SignUpPage.module.css";
import UserAvatar from "../../assets/user-image.jpg";

const url = import.meta.env.VITE_BACKEND_URL;

const SignUpPage = () => {
  const [result, setResult] = useState("");
  const [visible, setVisible] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const setUser = useCentralStore((state) => state.setUser);
  const setSocket = useCentralStore((state) => state.setSocket);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: "onChange" });
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  const file = watch("file");

  const handleClick = () => {
    fileRef.current.click();
  };
  // Convert imported image URL to a File object
  const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    /* let fileToUpload;

    if (data.file && data.file[0]) {
      // User uploaded an image
      fileToUpload = data.file[0];
    } else {
      // No upload → use default image
      fileToUpload = await urlToFile(UserAvatar, "default_user_pic.png");
    } */
    formData.append("file", data.file[0]);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const res = await fetch(`${url}/api/user/signup`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const responseData = await res.json();
      setResult(responseData);
      console.log(responseData);

      if (!res.ok) {
        setVisible(true);
        return;
      }

      const socket = io(`${url}`, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      setSocket(socket);
      setUser(responseData.user);
      navigate("/main");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Branding */}
      <div className={styles.brandContainer}>
        <h1 className={styles.brandName}>Convy...</h1>
      </div>

      {/* Signup Card */}
      <div className={styles.formCard}>
        <h2 className={styles.heading}>Create a new account</h2>
        <p className={styles.subText}>It’s quick and easy.</p>

        {visible && <div className={styles.errorBox}>{result.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Profile Picture Upload */}
          <div className={styles.avatarUpload} onClick={handleClick}>
            <div className={styles.avatarPreview}>
              {file?.[0] ? (
                <img
                  src={URL.createObjectURL(file[0])}
                  alt="Preview"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <img src={UserAvatar} alt="User Avatar" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              {...register("file", {
                required: false,
                validate: {
                  lessThan5MB: (files) => {
                    if (!files || files.length === 0) return true; // ✅ no file = valid
                    return (
                      files[0].size < 5 * 1024 * 1024 ||
                      "File size should be less than 5MB"
                    );
                  },
                  acceptedFormats: (files) => {
                    if (!files || files.length === 0) return true; // ✅ no file = valid
                    const accepted = ["image/jpeg", "image/png", "image/webp"];
                    return (
                      accepted.includes(files[0].type) ||
                      "This file format is not supported"
                    );
                  },
                },
              })}
              ref={(e) => {
                fileRef.current = e;
                register("file").ref(e);
              }}
              className={styles.hiddenInput}
            />
            {errors.file && (
              <p className={styles.errorText}>{errors.file.message}</p>
            )}
          </div>

          {/* Username */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 4,
                  message: "Username must be at least 4 characters",
                },
              })}
              className={styles.input}
            />
            {errors.username && (
              <p className={styles.errorText}>{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email ID"
              {...register("email", {
                required: "Email ID is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={styles.input}
            />
            {errors.emailID && (
              <p className={styles.errorText}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={styles.input}
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Sign Up
          </button>
        </form>
      </div>

      <p className={styles.footerText}>
        Already have an account?
        <Link to="/" className={styles.signInLink}>
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
