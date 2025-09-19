import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useHistory } from "react-router-dom";

import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";

import axios from "../../axios";

import "./Login.css";

function Login() {
  const [, dispatch] = useStateValue();
  const history = useHistory();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const alertBox = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function showAlert() {
    if (alertBox.current.classList.contains("d-none")) {
      alertBox.current.classList.remove("d-none");
    }
  }

  function hideAlert() {
    if (!alertBox.current.classList.contains("d-none")) {
      alertBox.current.classList.add("d-none");
    }
  }

  function showLoading() {
    dispatch({
      type: actionTypes.LOADING,
      isLoading: true,
    });
  }

  function hideLoading() {
    dispatch({
      type: actionTypes.LOADING,
      isLoading: false,
    });
  }

  function handleLogin(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    hideAlert();

    axios
      .post("/api/admin/login", {
        email: formData.email.trim(),
        password: formData.password,
      })
      .then((response) => {
        if (response.data.success) {
          // Store admin data and token
          try {
            localStorage.setItem(
              "adminAuth",
              JSON.stringify({
                token: response.data.token,
                admin: response.data.data.admin,
              })
            );
          } catch (e) {}
          dispatch({
            type: actionTypes.AUTH,
            isAuth: true,
            accessToken: response.data.token,
            admin: response.data.data.admin,
          });

          setMessage({
            type: "success",
            text: "Login successful! Redirecting...",
          });

          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            history.push("/admin");
          }, 1000);
        } else {
          setMessage({
            type: "danger",
            text: response.data.message || "Login failed",
          });
          showAlert();
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        let errorMessage = "Something went wrong. Please try again.";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMessage =
            "Invalid email or password. Please check your credentials.";
        } else if (err.response?.status === 400) {
          errorMessage = "Please provide valid email and password.";
        } else if (err.response?.status === 403) {
          errorMessage =
            "Your account has been deactivated. Please contact administrator.";
        } else if (err.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (!err.response) {
          errorMessage =
            "Network error. Please check your internet connection.";
        }

        setMessage({ type: "danger", text: errorMessage });
        showAlert();
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div>
      <Helmet>
        <title>Login -Hotel Royal Blue Star</title>
      </Helmet>
      <div className="register d-flex align-items-center justify-content-center">
        <div className="row justify-content-center w-100">
          <div className="col-md-4">
            <h1 className="text-center register__title">Admin Login</h1>

            {message.text && (
              <div
                className={`alert alert-${message.type} mt-3 mb-3`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <div className="alert alert-danger mt-3 mb-3 d-none" ref={alertBox}>
              {message.text}
            </div>

            <form className="mt-3" onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Enter your email..."
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your password..."
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePasswordVisibility}
                    style={{
                      borderColor: errors.password ? "#dc3545" : "#ced4da",
                    }}
                  >
                    <i
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <button
                type="submit"
                className="button mt-2 w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div className="d-flex align-items-center justify-content-center mt-3">
                <Link to="/" className="text-decoration-none">
                  <i className="fas fa-home me-2"></i>
                  Go To Home Page
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
