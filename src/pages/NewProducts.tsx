import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const FALLBACK_PRODUCTS = [
  {
    id: 'demo-1',
    title: 'Plaquettes de frein Bosch avant',
    price: 45000,
    images: JSON.stringify(['/images/brake_pads_1780235558702.png']),
    state: 'NEW',
    brand: 'BOSCH',
    stock: 15,
    vendorId: 'demo-vendor-1',
    vendor: { businessName: 'Auto Parts Mali' }
  },
  {
    id: 'demo-2',
    title: 'Filtre à Huile Purflux',
    price: 12000,
    images: JSON.stringify(['/images/oil_filter_1780235628194.png']),
    state: 'NEW',
    brand: 'PURFLUX',
    stock: 30,
    vendorId: 'demo-vendor-1',
    vendor: { businessName: 'BigMoteurs Store' }
  },
  {
    id: 'demo-3',
    title: 'Amortisseur Avant Toyota',
    price: 85000,
    images: JSON.stringify(['/images/shock_absorber_1780235541576.png']),
    state: 'USED',
    brand: 'TOYOTA',
    stock: 5,
    vendorId: 'demo-vendor-2',
    vendor: { businessName: 'Garage du Centre' }
  },
  {
    id: 'demo-4',
    title: 'Bougie NGK BKR6E',
    price: 3500,
    images: JSON.stringify(['/images/led_headlight_1780235575069.png']),
    state: 'NEW',
    brand: 'NGK',
    stock: 50,
    vendorId: 'demo-vendor-2',
    vendor: { businessName: 'AutoShop Bénin' }
  },
  {
    id: 'demo-5',
    title: 'Courroie de distribution Gates',
    price: 28000,
    images: JSON.stringify(['/images/car_engine_bay_1780234773130.png']),
    state: 'NEW',
    brand: 'GATES',
    stock: 20,
    vendorId: 'demo-vendor-1',
    vendor: { businessName: 'Auto Parts Mali' }
  },
  {
    id: 'demo-6',
    title: 'Kit embrayage Valeo',
    price: 120000,
    images: JSON.stringify(['/images/car_parts_composition_1780234792189.png']),
    state: 'NEW',
    brand: 'VALEO',
    stock: 8,
    vendorId: 'demo-vendor-2',
    vendor: { businessName: 'Garage du Centre' }
  },
];

export default function NewProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('API indisponible');
        return res.json();
      })
      .then(data => {
        setProducts(data.products?.length ? data.products : FALLBACK_PRODUCTS);
        setLoading(false);
      })
      .catch(() => {
        setProducts(FALLBACK_PRODUCTS as any);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-2xl shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#0B1C2E]" />
          </button>
          <h2 className="text-2xl font-bold text-[#0B1C2E]">Nouveautés</h2>
        </div>
      </div>

      <div className="px-6 mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B91C1C]"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 font-medium">Aucune nouveauté pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
