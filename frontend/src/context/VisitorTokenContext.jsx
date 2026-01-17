import React, { createContext, useContext, useState, useEffect } from "react";

const VISITOR_TOKEN_KEY = "visitorToken";
import { serverUrl } from "../services/ServerUrl";

const API_BASE_URL = serverUrl;

const VisitorTokenContext = createContext();

export const VisitorTokenProvider = ({ children }) => {
  const [visitorToken, setVisitorToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize token on mount
  useEffect(() => {
    initializeToken();
  }, []);

  const initializeToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for existing token in localStorage
      let token = localStorage.getItem(VISITOR_TOKEN_KEY);

      if (token) {
        // Validate existing token
        const isValid = await validateToken(token);
        if (isValid) {
          setVisitorToken(token);
          setIsLoading(false);
          return;
        }
        // Token is invalid/expired, remove it
        localStorage.removeItem(VISITOR_TOKEN_KEY);
      }

      // Create new token
      const newToken = await createToken();
      if (newToken) {
        localStorage.setItem(VISITOR_TOKEN_KEY, newToken);
        setVisitorToken(newToken);
      }
    } catch (err) {
      console.error("Error initializing visitor token:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/token`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status && data.data?.token) {
        console.log("✅ Visitor token created:", data.data.token.slice(0, 8) + "...");
        return data.data.token;
      }

      throw new Error(data.message || "Failed to create visitor token");
    } catch (err) {
      console.error("Error creating visitor token:", err);
      throw err;
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor/token/${token}`);
      const data = await response.json();
      if (data.status) {
        console.log("✅ Visitor token validated:", token.slice(0, 8) + "...");
      }
      return data.status === true;
    } catch (err) {
      console.error("Error validating visitor token:", err);
      return false;
    }
  };

  const refreshToken = async () => {
    localStorage.removeItem(VISITOR_TOKEN_KEY);
    await initializeToken();
  };

  const clearToken = () => {
    localStorage.removeItem(VISITOR_TOKEN_KEY);
    setVisitorToken(null);
  };

  return (
    <VisitorTokenContext.Provider
      value={{
        visitorToken,
        isLoading,
        error,
        refreshToken,
        clearToken,
      }}
    >
      {children}
    </VisitorTokenContext.Provider>
  );
};

export const useVisitorTokenContext = () => useContext(VisitorTokenContext);

export default VisitorTokenContext;
