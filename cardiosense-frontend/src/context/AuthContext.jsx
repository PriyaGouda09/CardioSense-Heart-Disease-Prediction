import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cardiosense_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedPredictions, setSavedPredictions] = useState(() => {
    try {
      const saved = localStorage.getItem("cardiosense_saved_results");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("cardiosense_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cardiosense_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cardiosense_saved_results", JSON.stringify(savedPredictions));
  }, [savedPredictions]);

  // Mock Login with 800ms delay
  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation: reject if password is wrong demo value if tested
    if (password === "wrongpassword") {
      throw new Error("Invalid email or password. Please try again.");
    }

    const authUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: email,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    setUser(authUser);
    return authUser;
  };

  // Mock Google Login
  const loginWithGoogle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const authUser = {
      id: "usr-g-" + Math.random().toString(36).substring(2, 8),
      name: "Alex Morgan",
      email: "alex.morgan@gmail.com",
      isGuest: false,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    setUser(authUser);
    return authUser;
  };

  // Mock Signup with 800ms delay
  const signup = async (name, email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const authUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      name: name.trim(),
      email: email.trim(),
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    setUser(authUser);
    return authUser;
  };

  // Guest login
  const continueAsGuest = () => {
    const guestUser = {
      id: "guest-" + Math.random().toString(36).substring(2, 8),
      name: "Guest Visitor",
      email: "guest@cardiosense.demo",
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    return guestUser;
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  // Save a prediction result to account
  const savePredictionToAccount = (prediction) => {
    if (!prediction || !user || user.isGuest) return false;
    setSavedPredictions((prev) => {
      const exists = prev.some((p) => p.id === prediction.id);
      if (exists) return prev;
      return [prediction, ...prev];
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isGuest: user?.isGuest ?? false,
        login,
        loginWithGoogle,
        signup,
        continueAsGuest,
        logout,
        savedPredictions,
        savePredictionToAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
