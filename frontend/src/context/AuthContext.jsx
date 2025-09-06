import React, { createContext, useState, useEffect} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  });


  // when admin close the tab then logged him out.
  useEffect(() => {
    // Listen for page unload and clear admin session if active
    const handleBeforeUnload = () => {
      if (auth.role === 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setAuth({ token: null, role: null, isAuthenticated: false });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [auth.role]);

  const login = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setAuth({ token, role, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth({ token: null, role: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
