import { useState, useEffect, useRef } from 'react';
import { Mail, Send, CheckCircle, Info, MessageCircle, Camera, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [vin, setVin] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleScan = () => {
    setScanning(true);
    // Simulation d'un scan de 1.5 secondes
    setTimeout(() => {
      const mockVin = 'VF33HZYB9' + Math.floor(10000000 + Math.random() * 90000000).toString();
      setVin(mockVin);
      setScanning(false);
    }, 1500);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log("=== SIMULATION ENVOI EMAIL CONTACT ENRICHI ===");
    console.log("To: admin@bigmoteurs.ci");
    console.log(`Subject: ✉️ Nouveau message de contact : ${data.subject}`);
    console.log("Body:");
    console.log(`- De : ${data.name} (${user?.email})`);
    console.log(`- Adresse : ${data.address}`);
    console.log(`- Numero Châssis (VIN) : ${vin}`);
    console.log(`- Photo jointe : ${photo ? photo.name : 'Aucune'}`);
    console.log(`- Type d'utilisateur : ${user?.role}`);
    console.log(`- Sujet : ${data.subject}`);
    console.log(`- Message : \n${data.message}`);
    console.log("==================================================");

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      form.reset();
      setVin('');
      setPhoto(null);
      setPhotoPreview(null);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 pb-24 items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B1C2E] mb-2">Message envoyé !</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Votre message a été transmis à l'administration. Nous vous répondrons dans les plus brefs délais par email.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-[#0B1C2E] text-white px-8 py-3.5 rounded-full font-bold shadow-lg w-full max-w-xs transition-transform active:scale-95"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#0B1C2E] px-6 pt-16 pb-12 rounded-b-2xl shadow-sm text-white relative">
        <div className="absolute right-4 top-12 opacity-10">
          <Mail className="w-24 h-24" />
        </div>
        <img src="/logo1.png" alt="BigMoteurs Logo" className="h-12 w-auto mb-4 relative z-10 object-contain bg-white/90 p-2 rounded-xl" />
        <h2 className="text-2xl font-bold relative z-10">Nous Contacter</h2>
        <p className="mt-2 text-sm text-gray-300 relative z-10">L'équipe BigMoteurs à votre écoute</p>
      </div>

      {/* Form Area */}
      <div className="flex-1 px-6 mt-6 space-y-6">
        
        {/* WhatsApp Quick Contact */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-sm font-bold text-[#0B1C2E] mb-3">Besoin d'une réponse immédiate ?</h3>
          <a 
            href="https://wa.me/22996694937" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#1ebd59] transition-colors active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Contactez-nous sur WhatsApp
          </a>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 shadow-sm">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Pour toute question, réclamation ou assistance technique, veuillez remplir le formulaire ci-dessous.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-10">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            
            {/* Nom */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom complet</label>
              <input 
                type="text"
                name="name"
                required
                defaultValue={user?.name}
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium"
                placeholder="Votre nom complet"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Adresse / Localisation</label>
              <input 
                type="text"
                name="address"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium"
                placeholder="Ex: Abidjan, Cocody"
              />
            </div>

            {/* VIN / Numero Chassis avec Scanner */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro Châssis (VIN)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  name="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="flex-1 bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-mono"
                  placeholder="17 caractères (ex: VF33...)"
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
              <p className="text-[10px] text-gray-400 mt-1 italic">Utilisez le scanner pour capturer automatiquement le code sur votre véhicule.</p>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Photo (Optionnel)</label>
              {!photoPreview ? (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs font-medium">Joindre une photo</span>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover" />
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Sujet */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Sujet de votre demande</label>
              <select 
                name="subject"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium"
                defaultValue=""
              >
                <option value="" disabled>Sélectionnez un sujet</option>
                <option value="Suivi de commande">Suivi de ma commande</option>
                <option value="Problème de paiement">Problème de paiement</option>
                <option value="Retour / Remboursement">Demande de retour ou remboursement</option>
                {user?.role === 'VENDOR' && <option value="Assistance Vendeur">Assistance pour mon compte Vendeur</option>}
                <option value="Signaler un abus">Signaler un abus ou litige</option>
                <option value="Autre">Autre demande</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Votre message</label>
              <textarea 
                name="message"
                required
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] resize-none"
                placeholder="Décrivez votre problème en détail..."
              ></textarea>
            </div>
            
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#B91C1C] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 mt-4 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer le message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
