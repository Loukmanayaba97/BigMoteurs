import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Check, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const PRESET_IMAGES = [
  {
    name: 'Moteur',
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Freins / Disques',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Pneus / Suspension',
    url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Phares / Électricité',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Carrosserie',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
  },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [vin, setVin] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
      setErrorMsg("Seuls les comptes vendeurs peuvent ajouter des produits.");
    }
  }, [user, navigate]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const mockVin = 'VF33HZYB9' + Math.floor(10000000 + Math.random() * 90000000).toString();
      setVin(mockVin);
      setScanning(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errorMsg) return;

    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString();
    const brand = formData.get('brand')?.toString();
    const model = formData.get('model')?.toString();
    const year = formData.get('year')?.toString();
    const oemRef = formData.get('oemRef')?.toString();
    const category = formData.get('category')?.toString();
    const state = formData.get('state')?.toString();
    const price = formData.get('price')?.toString();
    const stock = formData.get('stock')?.toString();
    const description = formData.get('description')?.toString();

    const imageUrl = customImageUrl.trim() || selectedImage;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brand,
          model,
          vin,
          year: year ? parseInt(year) : null,
          oemRef: oemRef || null,
          category,
          state,
          price: parseFloat(price || '0'),
          stock: parseInt(stock || '0'),
          images: [imageUrl],
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la mise en ligne.");
      }

      navigate('/vendor-dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-2xl shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#0B1C2E]" />
          </button>
          <h2 className="text-2xl font-bold text-[#0B1C2E]">Ajouter un produit</h2>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-lg mx-auto">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Images Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <label className="block text-sm font-bold text-[#0B1C2E]">Image de la pièce</label>
            
            {/* Visual Grid of Preset Options */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.url && !customImageUrl
                      ? 'border-[#B91C1C] scale-95 ring-2 ring-red-100'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white text-center bg-black/40 py-0.5 rounded uppercase truncate">
                    {img.name}
                  </span>
                  {selectedImage === img.url && !customImageUrl && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-[#B91C1C] text-white rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Ou URL d'image personnalisée</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B91C1C] transition-colors"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          </div>

          {/* Form details */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2 text-sm">Caractéristiques principales</h3>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Titre du produit</label>
              <input 
                type="text" 
                name="title"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                placeholder="Ex: Plaquettes de frein Bosch..." 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Marque</label>
                <input 
                  type="text" 
                  name="brand"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                  placeholder="Ex: Toyota, Bosch" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Modèle compatible</label>
                <input 
                  type="text" 
                  name="model"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                  placeholder="Ex: RAV4, Corolla" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Année du véhicule</label>
                <input 
                  type="number" 
                  name="year"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                  placeholder="Ex: 2018" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Référence OEM (Optionnel)</label>
                <input 
                  type="text" 
                  name="oemRef"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors font-mono"
                  placeholder="Ex: 04465-42200" 
                />
              </div>
            </div>

            {/* VIN Field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro Châssis (VIN)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  required
                  className="flex-1 bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors font-mono"
                  placeholder="17 caractères (Obligatoire)" 
                />
                <button 
                  type="button"
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-[#0B1C2E] text-white p-3 rounded-xl shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[50px]"
                >
                  {scanning ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Le VIN est obligatoire pour garantir la compatibilité des pièces.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Catégorie</label>
                <select 
                  name="category"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                >
                  <option value="Moteur">Moteur</option>
                  <option value="Freins">Freins</option>
                  <option value="Filtres">Filtres</option>
                  <option value="Carrosserie">Carrosserie</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Échappement">Échappement</option>
                  <option value="Refroidissement">Refroidissement</option>
                  <option value="Éclairage">Éclairage</option>
                  <option value="Électricité">Électricité</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">État de la pièce</label>
                <select 
                  name="state"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                >
                  <option value="NEW">Neuf</option>
                  <option value="USED">Occasion</option>
                  <option value="REFURBISHED">Reconditionné</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Prix (FCFA)</label>
                <input 
                  type="number" 
                  name="price"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors font-bold"
                  placeholder="0" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Stock disponible</label>
                <input 
                  type="number" 
                  name="stock"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                  placeholder="10" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Description supplémentaire</label>
              <textarea 
                rows={3}
                name="description"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] transition-colors"
                placeholder="Précisions sur la compatibilité, la garantie..." 
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!errorMsg}
            className="w-full bg-[#B91C1C] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Mettre en ligne la pièce
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
