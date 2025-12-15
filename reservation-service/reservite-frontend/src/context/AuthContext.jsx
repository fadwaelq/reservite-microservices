// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { jwtUtils } from '../utils/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au démarrage
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 1. Appel au service qui gère la requête ET le stockage du token/user normalisé
      await authService.login(email, password);

      // 2. Récupérer l'utilisateur normalisé (avec firstName, lastName, etc.) depuis le storage
      const normalizedUser = authService.getCurrentUser();

      // 3. Mettre à jour le state
      setUser(normalizedUser);

      // token factice pour le frontend (optionnel si vous utilisez déjà le vrai token)
      if (normalizedUser) {
        const fakeToken = btoa(JSON.stringify({ userId: normalizedUser.id, email: normalizedUser.email }));
        jwtUtils.saveToken(fakeToken);
      }

      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Échec de la connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);

      // Connexion automatique après inscription
      return await login(userData.email, userData.password);
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || "Échec de l'inscription"
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && jwtUtils.isAuthenticated();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};