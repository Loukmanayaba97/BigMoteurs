import { useState, useEffect } from 'react';
import { MapPin, Bell, Clock, Search as SearchIcon, Filter, Settings2, Disc, Car, Activity, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [activeLocation, setActiveLocation] = useState(() => {
    return localStorage.getItem('rp_location') || 'Bamako, Mali';
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const filters = ['Tout', 'Derniers', 'Populaire', 'Pièces'];

  const fallbackProducts = [
    {
      id: 'demo-1',
      name: 'Plaquettes de frein Brembo',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1600705574514-6d9b3da71ff1?auto=format&fit=crop&q=80&w=400',
      condition: 'NEUF',
      vendor: { businessName: 'Auto Parts Mali' }
    },
    {
      id: 'demo-2',
      name: 'Filtre à Huile Bosch',
      price: 8500,
      image: 'https://images.unsplash.com/photo-1635352721868-b7eb47eb8cdd?auto=format&fit=crop&q=80&w=400',
      condition: 'NEUF',
      vendor: { businessName: 'Bamako Pièces' }
    },
    {
      id: 'demo-3',
      name: 'Amortisseur Avant',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1598974534732-c75c510abac0?auto=format&fit=crop&q=80&w=400',
      condition: 'OCCASION',
      vendor: { businessName: 'Garage du Centre' }
    }
  ];

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(data => {
        setFeaturedProducts(data.products?.slice(0, 4) || fallbackProducts);
        setLoadingProducts(false);
      })
      .catch(() => {
        // Fallback for Netlify deployment where backend is absent
        setFeaturedProducts(fallbackProducts);
        setLoadingProducts(false);
      });
  }, []);

  const categories = [
    { name: 'Moteur', icon: <Settings2 className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
    { name: 'Freins', icon: <Disc className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
    { name: 'Filtres', icon: <Filter className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Carrosserie', icon: <Car className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600' },
    { name: 'Suspension', icon: <Activity className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
  ];

  const banners = [
    {
      id: 1,
      title: "Nouvelle Collection",
      subtitle: "Jusqu'à -50% sur votre première commande",
      image: "/src/assets/images/car_engine_bay_1780234773130.png",
      btnLabel: "Acheter"
    },
    {
      id: 2,
      title: "Kit Entretien",
      subtitle: "Pièces garanties pour tous modèles",
      image: "/src/assets/images/car_parts_composition_1780234792189.png",
      btnLabel: "Découvrir"
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      {/* Header Profile / Location */}
      <div className="px-6 pt-12 pb-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#B91C1C]" />
              Localisation
            </p>
            <button 
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xl font-bold text-[#0B1C2E] hover:text-[#B91C1C] transition-colors focus:outline-none"
            >
              {user ? `Salut, ${user.name}` : activeLocation}
              <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200" style={{ transform: showLocationDropdown ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showLocationDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLocationDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Choisir la région active
                  </div>
                  <button
                    onClick={() => {
                      setActiveLocation('Bamako, Mali');
                      localStorage.setItem('rp_location', 'Bamako, Mali');
                      setShowLocationDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors",
                      activeLocation === 'Bamako, Mali' ? "font-semibold text-[#B91C1C] bg-red-50/50" : "text-gray-700"
                    )}
                  >
                    <span className="flex items-center gap-2">🇲🇱 Bamako, Mali</span>
                    {activeLocation === 'Bamako, Mali' && <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></span>}
                  </button>
                  <button
                    onClick={() => {
                      setActiveLocation('Cotonou, Bénin');
                      localStorage.setItem('rp_location', 'Cotonou, Bénin');
                      setShowLocationDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors",
                      activeLocation === 'Cotonou, Bénin' ? "font-semibold text-[#B91C1C] bg-red-50/50" : "text-gray-700"
                    )}
                  >
                    <span className="flex items-center gap-2">🇧🇯 Cotonou, Bénin</span>
                    {activeLocation === 'Cotonou, Bénin' && <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></span>}
                  </button>
                </div>
              </>
            )}
          </div>
          <button className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center relative border border-gray-100">
             <Bell className="w-5 h-5 text-gray-600" />
             <span className="absolute top-3 right-3 w-2 h-2 bg-[#B91C1C] rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Search Bar matching design */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const q = formData.get('search')?.toString() || '';
            navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
          className="flex gap-3"
        >
          <div className="flex-1 relative shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] rounded-xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              name="search"
              placeholder="Rechercher une pièce..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#B91C1C] text-sm text-[#0B1C2E] placeholder-gray-400"
            />
          </div>
          <button type="submit" className="w-14 h-[54px] bg-[#0B1C2E] rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md">
            <Settings2 className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="px-6 mt-2 mb-6">
        {/* Promotional Banners (Horizontal Scroll) */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x focus:outline-none">
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="relative rounded-2xl overflow-hidden shadow-sm flex-shrink-0 snap-center w-full aspect-[2/1] max-h-[160px]"
            >
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              
              <div className="relative z-10 p-6 h-full flex flex-col justify-center w-2/3">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                  {banner.title}
                </h3>
                <p className="text-xs text-gray-200 mb-4">{banner.subtitle}</p>
                <div>
                  <button className="bg-[#B91C1C] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-red-700 transition-colors shadow-md">
                    {banner.btnLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 mt-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#0B1C2E]"></span>
           <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
        </div>
      </div>

      <div className="px-6 mb-6">
        {/* Categories Section */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-[#0B1C2E]">Catégories</h3>
          <Link to="/categories" className="text-xs text-[#B91C1C] font-bold">Voir Tout</Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar -mx-6 px-6 focus:outline-none">
          {categories.map((cat, idx) => (
            <Link to={`/search?category=${cat.name}`} key={idx} className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-medium text-[#0B1C2E] whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Sample empty state or list area */}
      <div className="pl-6 mt-2 mb-8">
        <div className="flex flex-col mb-4 pr-6">
          <div className="flex justify-between items-end mb-3">
             <h3 className="font-bold text-lg text-[#0B1C2E]">Promotions</h3>
             <span className="text-xs text-gray-500 flex items-center gap-1">Finition dans : <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[#B91C1C] font-bold">02</span> : <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[#B91C1C] font-bold">12</span> : <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[#B91C1C] font-bold">56</span></span>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors",
                  activeFilter === filter ? "text-white" : "text-gray-600 bg-white border border-gray-200 shadow-sm"
                )}
              >
                {activeFilter === filter && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-[#0B1C2E] rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            ))}
          </div>
        </div>
        
        {loadingProducts ? (
          // Skeleton shimmer animation
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar pr-6">
            {[1,2,3].map(i => (
              <div key={i} className="w-[170px] flex-shrink-0">
                <div className="bg-gray-100 rounded-2xl h-[170px] animate-pulse mb-2" />
                <div className="bg-gray-100 rounded h-3 w-3/4 animate-pulse mb-1" />
                <div className="bg-gray-100 rounded h-3 w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar pr-6 focus:outline-none">
            {featuredProducts.map((product: any) => (
              <div key={product.id} className="w-[170px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mr-6 bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 flex flex-col items-center justify-center h-32">
            <p className="text-sm text-gray-400 font-medium">Aucun produit disponible</p>
            <button onClick={() => navigate('/search')} className="mt-2 text-xs text-[#B91C1C] font-bold">Parcourir le catalogue →</button>
          </div>
        )}

        {/* Nouveautés */}
        <div className="flex justify-between items-center mb-4 pr-6 mt-6">
          <h3 className="font-bold text-lg text-[#0B1C2E]">Nouveautés</h3>
          <Link to="/nouveautes" className="text-xs text-[#B91C1C] font-bold">Voir Tout</Link>
        </div>

        {loadingProducts ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar pr-6">
            {[1,2,3].map(i => (
              <div key={i} className="w-[170px] flex-shrink-0">
                <div className="bg-gray-100 rounded-2xl h-[170px] animate-pulse mb-2" />
                <div className="bg-gray-100 rounded h-3 w-3/4 animate-pulse mb-1" />
                <div className="bg-gray-100 rounded h-3 w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar pr-6 focus:outline-none">
            {featuredProducts.map((product: any) => (
              <div key={product.id} className="w-[170px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mr-6 bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 flex flex-col items-center justify-center h-32">
            <p className="text-sm text-gray-400 font-medium">Aucun produit disponible</p>
            <button onClick={() => navigate('/search')} className="mt-2 text-xs text-[#B91C1C] font-bold">Parcourir le catalogue →</button>
          </div>
        )}
      </div>

    </div>
  );
}
