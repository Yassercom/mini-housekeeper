import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Call the login API
      const response = await adminAPI.login({ email, password });
      
      if (response.success && response.token) {
        // Si la connexion est réussie, rediriger vers le dashboard
        console.log('Connexion réussie, redirection vers le dashboard');
        navigate('/admin/dashboard');
        return; // Important: sortir de la fonction pour éviter d'afficher des erreurs
      }
      
      // Si on arrive ici, c'est qu'il y a eu un problème
      setError(response.message || 'Échec de connexion. Veuillez vérifier vos identifiants.');
      console.error('Échec de connexion:', response);
    } catch (err: any) {
      // Erreur technique (réseau, serveur, etc.)
      setError(err.response?.data?.message || 'Erreur technique lors de la connexion.');
      console.error('Erreur technique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Identifiants par défaut :</p>
            <p className="text-sm text-blue-700">Email: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin@minihousekeeper.com</span></p>
            <p className="text-sm text-blue-700 mt-1">Mot de passe: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin123</span></p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Need help? Contact system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
