// src/utils/jwt.js
export const jwtUtils = {
  saveToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Vérifier si le token est expiré (si c'est un vrai JWT)
      // Pour l'instant, on vérifie juste qu'il existe
      return true;
    } catch (error) {
      return false;
    }
  },

  decodeToken: (token) => {
    try {
      // Décoder un JWT (si vous utilisez un vrai JWT backend)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }
};