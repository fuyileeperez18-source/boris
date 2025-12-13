import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          const response = await authService.getProfile();
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido o expirado
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Registrar usuario
  const register = async (data) => {
    const response = await authService.register(data);
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(user);
    setIsAuthenticated(true);

    return user;
  };

  // Iniciar sesión
  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(user);
    setIsAuthenticated(true);

    return user;
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores de logout
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar perfil
  const updateProfile = async (data) => {
    const response = await authService.updateProfile(data);
    setUser(response.data.data);
    return response.data.data;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
