import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ArrowRight, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleDemoLogin = () => {
    setAuth(
      { id: 'demo123', name: 'Utilisateur Démo', email: 'demo@bigmoteurs.ci', role: 'CLIENT', kycStatus: 'APPROVED' }, 
      'demo-token'
    );
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 relative">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-6 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
      >
        <ArrowLeft className="w-6 h-6 text-[#0B1C2E]" />
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-6">
        <img src="/logo1.png" alt="BigMoteurs Logo" className="h-16 w-auto mx-auto object-contain" />
        <h2 className="mt-6 text-center text-2xl font-semibold leading-9 tracking-tight text-gray-900">
          Connexion à votre compte
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow-xl sm:rounded-xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm sm:leading-6 bg-gray-50"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Mot de passe
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm sm:leading-6 bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm leading-6">
                <a href="#" className="font-semibold text-[#B91C1C] hover:text-[#c41530]">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-[#0B1C2E] px-3 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#162e49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1C2E] transition-all"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6">
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-200"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                 <span className="bg-white px-2 text-gray-500">Ou</span>
               </div>
             </div>

             <div className="mt-6 flex flex-col gap-3">
               <button
                 onClick={handleDemoLogin}
                 className="flex w-full justify-center items-center gap-2 rounded-full bg-blue-50 px-3 py-4 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
               >
                 Accéder en tant que Client (Démo)
               </button>
               
               <button
                 onClick={() => {
                   setAuth(
                     { id: 'vendor123', name: 'Boutique Auto', email: 'vendor@bigmoteurs.ci', role: 'VENDOR', kycStatus: 'APPROVED' }, 
                     'demo-vendor-token'
                   );
                   navigate('/');
                 }}
                 className="flex w-full justify-center items-center gap-2 rounded-full bg-emerald-50 px-3 py-4 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
               >
                 Accéder en tant que Vendeur (Démo)
               </button>

               <button
                 onClick={() => {
                   setAuth(
                     { id: 'admin123', name: 'Super Admin', email: 'admin@bigmoteurs.ci', role: 'ADMIN', kycStatus: 'APPROVED' }, 
                     'demo-admin-token'
                   );
                   navigate('/admin');
                 }}
                 className="flex w-full justify-center items-center gap-2 rounded-full bg-purple-50 px-3 py-4 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-all border border-purple-100"
               >
                 Accéder en tant qu'Administrateur
               </button>
             </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold leading-6 text-[#B91C1C] hover:text-[#c41530]">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
