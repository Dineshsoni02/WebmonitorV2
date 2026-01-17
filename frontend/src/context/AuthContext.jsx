import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { serverUrl } from "../services/ServerUrl";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshToken = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.tokens?.refreshToken?.token) return;

      const response = await fetch(`${serverUrl}/user/refresh-token`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: storedUser.tokens.refreshToken.token,
        }),
      });

      const data = await response.json();
      if (data?.status) {
        saveUser(data.data);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Cross-tab session synchronization
  // When user logs in/out from another tab, this tab gets notified instantly
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        if (event.newValue === null) {
          // User logged out from another tab
          setUser(null);
        } else {
          // User logged in from another tab - check if it's a different session
          try {
            const newUserData = JSON.parse(event.newValue);
            const currentToken = user?.tokens?.accessToken?.token;
            const newToken = newUserData?.tokens?.accessToken?.token;

            if (currentToken && newToken && currentToken !== newToken) {
              // Different token means this session is invalidated
              setUser(null);
              // Show a message to the user
              alert("You have been logged out because you logged in from another window.");
            } else if (!currentToken && newToken) {
              // No current session, update with new one
              setUser(newUserData);
            }
          } catch (e) {
            // Silently ignore parsing errors
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  useEffect(() => {
    if (!user?.tokens?.accessToken?.expireAt) return;

    const expiryTime = new Date(user.tokens.accessToken.expireAt).getTime();
    const now = Date.now();

    const timeout = expiryTime - now - 60 * 1000;

    if (timeout > 0) {
      const timer = setTimeout(() => {
        refreshToken();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [user, refreshToken]);

  const saveUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Handle session invalidation from API calls (for cross-browser/profile detection)
  const handleSessionInvalid = useCallback((message = "Your session has expired or been invalidated.") => {
    localStorage.removeItem("user");
    setUser(null);
    alert(message);
  }, []);

  // Validate session with server when window regains focus (catches cross-browser invalidation)
  useEffect(() => {
    const validateSession = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.tokens?.accessToken?.token) return;

      try {
        // Make a lightweight request to validate token
        const response = await fetch(`${serverUrl}/website`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.tokens.accessToken.token}`,
          },
        });

        const data = await response.json();
        if (data?.status === false && data?.message === "Invalid token") {
          handleSessionInvalid("You have been logged out because you logged in from another browser/device.");
        }
      } catch (err) {
        // Silently ignore validation errors
      }
    };

    const handleFocus = () => {
      if (user) {
        validateSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, handleSessionInvalid]);

  return (
    <AuthContext.Provider value={{ user, saveUser, logout, refreshToken, handleSessionInvalid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
