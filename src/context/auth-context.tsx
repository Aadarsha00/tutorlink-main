import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api, {
  type User,
  type LoginData,
  type RegisterData,
} from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed value for authentication status
  const isAuthenticated = !!user && !!localStorage.getItem("access_token");

  // Load user on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.auth.getCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const tokens = await api.auth.login(data);
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    await api.auth.register(data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.replace("/");
  };

  // Refresh user data manually
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, user might be logged out
      if (!localStorage.getItem("access_token")) {
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
