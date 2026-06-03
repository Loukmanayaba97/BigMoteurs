import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/cart';

const FALLBACK_PRODUCTS: Record<string, any> = {
  'demo-1': {
    id: 'demo-1', title: 'Plaquettes de frein Bosch avant', price: 45000,
    images: JSON.stringify(['/images/brake_pads_1780235558702.png']),
    state: 'NEW', brand: 'BOSCH', stock: 15, vendorId: 'demo-vendor-1',
    vendor: { shopName: 'Auto Parts Mali' }
  },
  'demo-2': {
    id: 'demo-2', title: 'Filtre à Huile Purflux', price: 12000,
    images: JSON.stringify(['/images/oil_filter_1780235628194.png']),
    state: 'NEW', brand: 'PURFLUX', stock: 30, vendorId: 'demo-vendor-1',
    vendor: { shopName: 'BigMoteurs Store' }
  },
  'demo-3': {
    id: 'demo-3', title: 'Amortisseur Avant Toyota', price: 85000,
    images: JSON.stringify(['/images/shock_absorber_1780235541576.png']),
    state: 'USED', brand: 'TOYOTA', stock: 5, vendorId: 'demo-vendor-2',
    vendor: { shopName: 'Garage du Centre' }
  },
  'demo-4': {
    id: 'demo-4', title: 'Bougie NGK BKR6E', price: 3500,
    images: JSON.stringify(['/images/led_headlight_1780235575069.png']),
    state: 'NEW', brand: 'NGK', stock: 50, vendorId: 'demo-vendor-2',
    vendor: { shopName: 'AutoShop Bénin' }
  },
  'demo-5': {
    id: 'demo-5', title: 'Courroie de distribution Gates', price: 28000,
    images: JSON.stringify(['/images/car_engine_bay_1780234773130.png']),
    state: 'NEW', brand: 'GATES', stock: 20, vendorId: 'demo-vendor-1',
    vendor: { shopName: 'Auto Parts Mali' }
  },
  'demo-6': {
    id: 'demo-6', title: 'Kit embrayage Valeo', price: 120000,
    images: JSON.stringify(['/images/car_parts_composition_1780234792189.png']),
    state: 'NEW', brand: 'VALEO', stock: 8, vendorId: 'demo-vendor-2',
    vendor: { shopName: 'Garage du Centre' }
  },
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (id && FALLBACK_PRODUCTS[id]) {
      setProduct(FALLBACK_PRODUCTS[id]);
      setLoading(false);
      return;
    }
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('API indisponible');
        return res.json();
      })
      .then(data => {
        setProduct(data.product || (id ? FALLBACK_PRODUCTS[id] : null));
        setLoading(false);
      })
      .catch(() => {
        setProduct(id ? FALLBACK_PRODUCTS[id] || null : null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B91C1C]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
         <h2 className="text-xl font-bold text-[#0B1C2E] mb-2">Produit introuvable</h2>
         <button type="button" onClick={() => navigate(-1)} className="text-[#B91C1C] font-medium">Retour</button>
      </div>
    );
  }

  let images = [];
  try {
    images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  } catch (e) {
    if (typeof product.images === 'string') {
      images = [product.images];
    }
  }
  const defaultImage = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400';
  const imageUrl = images[0] ? images[0] : defaultImage;

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: imageUrl,
      quantity: 1,
      vendorId: product.vendorId
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="relative h-72 bg-white">
        <button
          type="button"
          aria-label="Retour"
          onClick={handleBack}
          className="absolute top-10 left-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#0B1C2E]" />
        </button>
        <img 
          src={imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>

      <div className="bg-white flex-1 -mt-6 rounded-t-3xl pt-6 px-6 pb-28 relative shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">
            {product.brand}
          </span>
          <span className="font-bold text-[#0B1C2E] flex items-center gap-1">
             <Star className="w-4 h-4 text-yellow-400 fill-current" />
             4.8 <span className="text-xs text-gray-400 font-normal">(24 avis)</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#0B1C2E] leading-tight mb-3">
          {product.title}
        </h1>

        <div className="flex items-center gap-2 mb-8">
          <span className="bg-gray-100 text-[#0B1C2E] text-xs font-bold px-2.5 py-1 rounded-md">
            {product.state === 'NEW' ? 'Neuf' : product.state === 'USED' ? 'Occasion' : 'Recond.'}
          </span>
          {product.oemRef && (
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md font-mono">
              OEM: {product.oemRef}
            </span>
          )}
          {product.vin && (
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md font-mono font-bold">
              Châssis: {product.vin}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-[#0B1C2E] text-lg">Informations</h3>
          
          <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-bold text-sm text-[#0B1C2E]">Vendu par {product.vendor?.shopName || 'Boutique'}</h4>
               <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Vendeur vérifié KYC. Satisfait ou remboursé sous 7 jours.</p>
             </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
               <Truck className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-bold text-sm text-[#0B1C2E]">Livraison Rapide</h4>
               <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Disponible pour expédition immédiate.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 flex items-center justify-between z-20">
        <div>
          <p className="text-xs text-gray-500 font-medium">Prix Total</p>
          <div className="font-extrabold text-[#B91C1C] text-2xl">
            {product.price.toLocaleString()} <span className="text-sm font-bold">FCFA</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="bg-[#0B1C2E] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-[#0B1C2E]/20 flex items-center gap-2 hover:bg-[#162e49] transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Ajouter
        </button>
      </div>
    </div>
  );
}
