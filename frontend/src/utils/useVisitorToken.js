import { useState, useEffect, useCallback } from "react";

const VISITOR_TOKEN_KEY = "visitorToken";
import { serverUrl } from "../services/ServerUrl";

const API_BASE_URL = serverUrl;

/**
 * Custom hook for managing visitor token
 * Generates and registers a new token on first visit
 * Provides token for all API requests
 */
export function useVisitorToken() {
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
      return data.status === true;
    } catch (err) {
      console.error("Error validating visitor token:", err);
      return false;
    }
  };

  const refreshToken = useCallback(async () => {
    localStorage.removeItem(VISITOR_TOKEN_KEY);
    await initializeToken();
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(VISITOR_TOKEN_KEY);
    setVisitorToken(null);
  }, []);

  return {
    visitorToken,
    isLoading,
    error,
    refreshToken,
    clearToken,
  };
}

/**
 * Get the current visitor token from localStorage
 * Synchronous helper for use in API calls
 */
export function getVisitorToken() {
  return localStorage.getItem(VISITOR_TOKEN_KEY);
}

/**
 * Helper to create headers with visitor token
 */
export function getVisitorHeaders(additionalHeaders = {}) {
  const visitorToken = getVisitorToken();
  return {
    "Content-type": "application/json",
    ...(visitorToken ? { "X-Visitor-Token": visitorToken } : {}),
    ...additionalHeaders,
  };
}
