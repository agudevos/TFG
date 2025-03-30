import React, { useState, useContext } from 'react';
import AuthContext from "../../utils/context/AuthContext";

const LoginPage = () => {
  const { loginUser, error } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!username || !password) {
      setError('Por favor ingresa nombre de usuario y contraseña');
      return;
    }
    
    setLoading(true);
    await loginUser({ username, password });
    setLoading(false); 
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Ingresa tus credenciales para acceder</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="text-gray-700">
                Contraseña
              </label>
              <a href="#" className="text-sm text-cyan-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              className={`w-full p-3 text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="text-cyan-600 hover:underline">
                Regístrate
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;