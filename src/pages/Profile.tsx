import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Settings, Store, CreditCard, ChevronRight, Car, Heart, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [subView, setSubView] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses local storage state
  const [addresses, setAddresses] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rp_addresses') || '["Maison (Mali)", "Bureau (Cotonou)"]');
    } catch {
      return [];
    }
  });

  // Garage local storage state
  const [garage, setGarage] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rp_garage') || '["Toyota Corolla 2018", "Mercedes C-Class 2015"]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (subView === 'orders' && user) {
      setOrdersLoading(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          setUserOrders(data.orders || []);
          setOrdersLoading(false);
        })
        .catch(err => {
          console.error(err);
          setOrdersLoading(false);
        });
    }
  }, [subView, user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    navigate('/');
  };

  if (!user) return null;

  const renderSubView = () => {
    switch (subView) {
      case 'orders':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Mes Commandes</h3>
            </div>
            
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B91C1C]"></div>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl p-6 border border-gray-100">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Vous n'avez pas encore passé de commande.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order: any) => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-[#0B1C2E] text-sm">CMD-{order.id.slice(0, 8).toUpperCase()}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'CONFIRMED' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'LITIGE' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {order.status === 'CONFIRMED' ? 'En attente' : order.status === 'LITIGE' ? 'En litige' : 'Livrée'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-600">
                          <span>{item.product?.title} (x{item.quantity})</span>
                          <span>{(item.unitPrice * item.quantity).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Total payé :</span>
                      <span className="font-bold text-[#B91C1C]">{order.total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'garage':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Mon Garage</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
              <h4 className="font-bold text-sm text-[#0B1C2E] mb-3">Ajouter un véhicule</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('vehicle') as HTMLInputElement;
                if (input.value.trim()) {
                  const updated = [...garage, input.value.trim()];
                  setGarage(updated);
                  localStorage.setItem('rp_garage', JSON.stringify(updated));
                  input.value = '';
                }
              }} className="flex gap-2">
                <input 
                  type="text" 
                  name="vehicle"
                  placeholder="Ex: Peugeot 3008 2020" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0B1C2E]"
                />
                <button type="submit" className="bg-[#0B1C2E] text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                  Ajouter
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {garage.map((car, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-[#0B1C2E] text-sm">{car}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = garage.filter((_, i) => i !== idx);
                      setGarage(updated);
                      localStorage.setItem('rp_garage', JSON.stringify(updated));
                    }}
                    className="text-xs text-red-600 font-bold"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Carnet d'Adresses</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
              <h4 className="font-bold text-sm text-[#0B1C2E] mb-3">Ajouter une adresse</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('address') as HTMLInputElement;
                if (input.value.trim()) {
                  const updated = [...addresses, input.value.trim()];
                  setAddresses(updated);
                  localStorage.setItem('rp_addresses', JSON.stringify(updated));
                  input.value = '';
                }
              }} className="flex gap-2">
                <input 
                  type="text" 
                  name="address"
                  placeholder="Ex: Maison, Cocody Mermoz" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0B1C2E]"
                />
                <button type="submit" className="bg-[#0B1C2E] text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                  Ajouter
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-[#0B1C2E] text-sm">{addr}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = addresses.filter((_, i) => i !== idx);
                      setAddresses(updated);
                      localStorage.setItem('rp_addresses', JSON.stringify(updated));
                    }}
                    className="text-xs text-red-600 font-bold"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'favorites':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Mes Favoris</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-gray-500 text-sm">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              Vos articles favoris s'afficheront ici.
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Moyens de Paiement</h3>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-[#0B1C2E] text-sm">Orange Money / MoMo</h4>
                  <p className="text-xs text-gray-500">Numéro principal lié</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Actif</span>
              </div>
              <p className="text-xs text-gray-400">Pour ajouter un nouveau compte Orange, MTN, Wave ou MoMo, utilisez le flux d'achat lors du paiement.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setSubView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
              </button>
              <h3 className="text-xl font-bold text-[#0B1C2E]">Paramètres du compte</h3>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Nom complet</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" defaultValue={user.name || ''} disabled />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">E-mail</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" defaultValue={user.email} disabled />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                Les modifications de nom et d'e-mail nécessitent une validation de sécurité du support.
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Profile */}
      <div className="bg-[#0B1C2E] px-6 pt-16 pb-12 rounded-b-2xl text-white relative shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-10">
           <ShieldCheck className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#0B1C2E] text-2xl font-bold shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-300 text-sm">{user.email}</p>
            <div className="mt-2 text-xs font-semibold px-2.5 py-1 bg-white/10 rounded backdrop-blur-md border border-white/20 inline-block">
              {user.role === 'VENDOR' ? 'Compte Vendeur' : user.role === 'ADMIN' ? 'Administrateur' : 'Client Privilège'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        {/* Vendor Section */}
        {user.role === 'VENDOR' && subView === null && (
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6">
            <div 
              onClick={() => navigate('/vendor-dashboard')}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0B1C2E]">Tableau de bord Vendeur</h3>
                <p className="text-sm text-gray-500">Gérer le stock et les ventes</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div 
              onClick={() => navigate('/add-product')}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0B1C2E]">Boutique & Produits</h3>
                <p className="text-sm text-gray-500">Ajouter ou modifier des pièces</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {subView === null ? (
          <>
            {/* Client Features Section */}
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              <div 
                onClick={() => setSubView('orders')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Mes Commandes</h3>
                  <p className="text-xs text-gray-500">Historique et suivis en cours</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div 
                onClick={() => navigate('/my-requests')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Mes Recherches de Pièces</h3>
                  <p className="text-xs text-gray-500">Suivre mes demandes spécifiques</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div 
                onClick={() => setSubView('garage')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Mon Garage (Véhicules)</h3>
                  <p className="text-xs text-gray-500">Enregistrez vos voitures pour des pièces 100% compatibles</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div 
                onClick={() => setSubView('favorites')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Mes Favoris</h3>
                  <p className="text-xs text-gray-500">Listes d'envies et pièces sauvegardées</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              <div 
                onClick={() => setSubView('addresses')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Carnet d'Adresses</h3>
                  <p className="text-xs text-gray-500">Maison, Bureau, Garagiste partenaire</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div 
                onClick={() => setSubView('payments')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Moyens de Paiement</h3>
                  <p className="text-xs text-gray-500">Cartes et portefeuilles MoMo</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div 
                onClick={() => setSubView('settings')}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-50 text-[#0B1C2E] rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B1C2E]">Paramètres du compte</h3>
                  <p className="text-xs text-gray-500">Mot de passe, e-mail, notifications</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 mb-4 text-[#B91C1C] font-bold bg-white rounded-xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {renderSubView()}
          </div>
        )}
      </div>
    </div>
  );
}
