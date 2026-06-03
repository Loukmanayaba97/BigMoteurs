import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { User, Mail, Lock, Phone, Globe } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'BUYER',
    country: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/logo1.png" alt="BigMoteurs Logo" className="h-16 w-auto mx-auto object-contain" />
        <h2 className="mt-6 text-center text-2xl font-semibold leading-9 tracking-tight text-gray-900">
          Créer un compte
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow-xl sm:rounded-xl sm:px-12 border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div className="flex bg-gray-100 p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                  formData.role === 'BUYER' ? 'bg-white shadow text-[#0B1C2E]' : 'text-gray-500'
                }`}
              >
                Acheteur
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'VENDOR' })}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                  formData.role === 'VENDOR' ? 'bg-white shadow text-[#B91C1C]' : 'text-gray-500'
                }`}
              >
                Vendeur
              </button>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm bg-gray-50"
                  placeholder={formData.role === 'VENDOR' ? "Nom de la boutique" : "Nom complet"}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm bg-gray-50"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm bg-gray-50"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={`block w-full rounded-xl border-0 py-3 pl-11 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm bg-gray-50 appearance-none font-medium ${formData.country ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <option value="" disabled>Sélectionnez votre pays</option>
                  <option value="BJ" className="text-gray-900">Bénin</option>
                  <option value="ML" className="text-gray-900">Mali</option>
                </select>
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-xl border-0 py-3 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B91C1C] sm:text-sm bg-gray-50"
                  placeholder="Mot de passe"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-full bg-[#B91C1C] px-3 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#c41530] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
              >
              {isLoading ? "Création..." : "S'inscrire"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold leading-6 text-[#0B1C2E] hover:text-[#162e49]">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
