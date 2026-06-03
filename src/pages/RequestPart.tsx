import { useState } from 'react';
import { ArrowLeft, Send, Upload, Camera, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RequestPart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          vehicle: data.vehicle,
          partName: data.partName,
          chassis: data.chassis || null,
          description: data.description || null,
          imageUrl: imageUrl || null
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B1C2E] mb-2">Demande envoyée !</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Notre équipe va chercher la pièce pour vous et vous contactera très rapidement avec un devis. L'administrateur a été notifié.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#0B1C2E] text-white px-8 py-3.5 rounded-full font-bold shadow-lg w-full max-w-xs"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white rounded-b-2xl shadow-sm sticky top-0 z-20 overflow-hidden">
        <div className="relative h-32 w-full">
          <img src="/images/car_engine_bay_1780234773130.png" alt="Engine" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2E] to-[#0B1C2E]/40" />
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-xl font-bold text-white">Pièce introuvable ?</h2>
            <p className="text-xs text-gray-200">Nous la trouvons pour vous</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            Remplissez ce formulaire avec un maximum de détails. Un expert BigMoteurs se chargera de sourcer votre pièce.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2">Informations de contact</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom complet</label>
              <input 
                type="text" 
                name="fullName"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Votre nom" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro de téléphone</label>
              <input 
                type="tel" 
                name="phone"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: 01 02 03 04 05" 
                required 
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2">Détails du véhicule & Pièce</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Marque & Modèle du véhicule</label>
              <input 
                type="text" 
                name="vehicle"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: Toyota Corolla 2018" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom de la pièce recherchée</label>
              <input 
                type="text" 
                name="partName"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: Phare avant droit, Alternateur..." 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro de châssis (Optionnel mais recommandé)</label>
              <input 
                type="text" 
                name="chassis"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="17 caractères" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Description supplémentaire</label>
              <textarea 
                rows={3}
                name="description"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Précisions utiles (motorisation, boîte auto/manuelle...)" 
              ></textarea>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-xs font-bold text-gray-600 mb-2">Photo de la pièce (si disponible)</label>
            <label htmlFor="photo-file" className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors block">
              <input 
                type="file" 
                id="photo-file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-[#0B1C2E]">
                {fileName ? fileName : "Appuyer pour ajouter une photo"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {imageUrl ? "Image chargée avec succès !" : "L'image aidera l'expert à l'identifier"}
              </p>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#E31837] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-[#B91C1C] transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer ma demande
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
