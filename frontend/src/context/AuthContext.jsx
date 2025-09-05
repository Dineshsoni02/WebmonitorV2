import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

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

  const refreshToken = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.tokens?.refreshToken?.token) return;

      const response = await fetch("http://localhost:5000/user/refresh-token", {
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
      console.error("Refresh token error:", err);
      logout();
      return false;
    }
  }, []);

  
  return (
    <AuthContext.Provider value={{ user, saveUser, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
