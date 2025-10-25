import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await authService.getMe();
        setUser(response.data.user);
      }
    } catch (error) {
      console.log("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError("");
      const response = await authService.login(email, password);

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        return { success: true, message: "Login successful" };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError("");
      const response = await authService.register(userData);

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        return { success: true, message: "Registration successful" };
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const clearError = () => {
    setError("");
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
