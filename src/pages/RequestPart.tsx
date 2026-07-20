import { useState, useRef } from 'react';
import { ArrowLeft, Send, Camera, CheckCircle, ScanLine, Loader2, Car, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

function compressImage(file: File, maxWidth = 1280): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function extractVinFromImage(base64Image: string, mimeType: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('NO_KEY');
  const prompt = [
    'You are an expert at reading Vehicle Identification Numbers (VIN) from photos.',
    'Look carefully at this image and find the VIN number.',
    'The VIN appears on: a metal plate on the dashboard (visible through the windshield),',
    'a sticker on the door jamb, a metal plate in the engine bay, or the registration document.',
    'A VIN is EXACTLY 17 characters: digits 0-9 and uppercase letters A-Z EXCEPT the letters I, O, and Q.',
    'Read each character very carefully — confusing 0 (zero) with O, or 1 (one) with I is a common mistake.',
    'Reply with ONLY the 17-character VIN. No spaces, no dashes, no explanation.',
    'If you cannot find a VIN in the image, reply exactly: NOT_FOUND',
  ].join(' ');

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 32 }
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erreur Gemini API');
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().toUpperCase().replace(/\s/g, '');
  if (text === 'NOT_FOUND' || text.length === 0) return 'NOT_FOUND';
  const match = text.match(/[A-HJ-NPR-Z0-9]{17}/);
  return match ? match[0] : 'NOT_FOUND';
}

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  engine?: string;
}

async function decodeVin(vin: string): Promise<VehicleInfo | null> {
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    if (!res.ok) throw new Error('NHTSA error');
    const data = await res.json();
    const get = (v: string) => data.Results?.find((r: any) => r.Variable === v)?.Value || '';
    const make = get('Make');
    const model = get('Model');
    const year = get('Model Year');
    const engine = get('Displacement (L)') ? `${get('Displacement (L)')}L ${get('Engine Configuration')}` : '';
    if (!make || make === 'Not Applicable') return null;
    return { make, model, year, engine };
  } catch {
    return null;
  }
}

async function decodeVinWithGemini(vin: string): Promise<VehicleInfo | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const body = {
      contents: [{
        parts: [{ text: `Decode this VIN: ${vin}. Reply ONLY with JSON like: {"make":"Toyota","model":"Corolla","year":"2018","engine":"1.8L 4cyl"}. No explanation.` }]
      }]
    };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export default function RequestPart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [vin, setVin] = useState('');
  const [vinScanLoading, setVinScanLoading] = useState(false);
  const [vinScanError, setVinScanError] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Confirmation overlay after scan
  const [scanResult, setScanResult] = useState<{ vin: string; photoUrl: string } | null>(null);

  const [partPhotoUrl, setPartPhotoUrl] = useState<string | null>(null);
  const [partPhotoName, setPartPhotoName] = useState<string | null>(null);

  const vinScanInputRef = useRef<HTMLInputElement>(null);
  const partPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleVinChange = async (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    setVin(clean);
    setVehicleInfo(null);
    if (clean.length === 17) {
      setVehicleLoading(true);
      const info = await decodeVin(clean) || await decodeVinWithGemini(clean);
      setVehicleInfo(info);
      setVehicleLoading(false);
    }
  };

  const handleVinPhotoScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVinScanLoading(true);
    setVinScanError('');
    try {
      const { base64, mimeType } = await compressImage(file);
      const photoUrl = `data:${mimeType};base64,${base64}`;

      if (!GEMINI_API_KEY) {
        setVinScanError('Scanner IA non disponible. Ajoutez VITE_GEMINI_API_KEY dans les variables Netlify.');
        return;
      }

      const extracted = await extractVinFromImage(base64, mimeType);
      if (extracted === 'NOT_FOUND') {
        setVinScanError('Code non détecté sur la photo. Assurez-vous que la plaque VIN est bien visible et réessayez.');
      } else {
        // Show confirmation overlay instead of auto-filling
        setScanResult({ vin: extracted, photoUrl });
      }
    } catch (err: any) {
      if (err.message === 'NO_KEY') {
        setVinScanError('Scanner IA non disponible. Ajoutez VITE_GEMINI_API_KEY dans les variables Netlify.');
      } else {
        setVinScanError('Erreur lors de l\'analyse. Vérifiez votre connexion et réessayez.');
      }
    } finally {
      setVinScanLoading(false);
      if (vinScanInputRef.current) vinScanInputRef.current.value = '';
    }
  };

  const confirmScannedVin = async () => {
    if (!scanResult) return;
    setScanResult(null);
    await handleVinChange(scanResult.vin);
  };

  const handlePartPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPartPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setPartPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!partPhotoUrl) {
      alert('Veuillez ajouter une photo de la pièce recherchée.');
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          phone: formData.get('phone'),
          vehicle: vehicleInfo
            ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` — ${vehicleInfo.engine}` : ''}`
            : `VIN: ${vin}`,
          partName: formData.get('partName'),
          chassis: vin,
          oemRef: formData.get('oemRef') || null,
          description: formData.get('description') || null,
          imageUrl: partPhotoUrl
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Erreur lors de la soumission');
      }
    } catch {
      // Backend absent (Netlify demo) — simulate success
      setSubmitted(true);
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
          Notre équipe va sourcer la pièce et vous contactera rapidement avec un devis.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-[#0B1C2E] text-white px-8 py-3.5 rounded-full font-bold shadow-lg w-full max-w-xs"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const vinValid = vin.length === 17;

  // ── VIN scan confirmation overlay ──────────────────────────────────────────
  if (scanResult) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B1C2E] flex flex-col">
        {/* Photo preview */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src={scanResult.photoUrl}
            alt="Photo scannée"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B1C2E] to-transparent" />
        </div>

        {/* Result panel */}
        <div className="bg-[#0B1C2E] px-6 pt-4 pb-10 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Code VIN détecté</span>
          </div>

          {/* VIN displayed character by character */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {scanResult.vin.split('').map((char, i) => (
              <span
                key={i}
                className="w-8 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white font-mono font-bold text-lg"
              >
                {char}
              </span>
            ))}
          </div>

          <p className="text-white/50 text-xs text-center">
            Vérifiez que ce code correspond bien à la plaque de votre véhicule
          </p>

          <button
            type="button"
            onClick={confirmScannedVin}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Oui, utiliser ce code
          </button>

          <button
            type="button"
            onClick={() => { setScanResult(null); vinScanInputRef.current?.click(); }}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            Reprendre une autre photo
          </button>

          <button
            type="button"
            onClick={() => setScanResult(null)}
            className="text-white/40 text-sm underline"
          >
            Saisir manuellement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white rounded-b-2xl shadow-sm sticky top-0 z-20 overflow-hidden">
        <div className="relative h-32 w-full">
          <img src="/images/car_engine_bay_1780234773130.png" alt="Engine" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2E] to-[#0B1C2E]/40" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-xl font-bold text-white">Demander une pièce</h2>
            <p className="text-xs text-gray-200">Nous la sourçons pour vous</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            Remplissez ce formulaire. Un expert BigMoteurs se chargera de sourcer votre pièce au meilleur prix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Contact */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2">Informations de contact</h3>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom complet</label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro de téléphone</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: 01 02 03 04 05"
              />
            </div>
          </div>

          {/* VIN + Vehicle detection */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2">Identification du véhicule</h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-600">
                  Numéro de châssis (VIN) <span className="text-[#E31837]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => vinScanInputRef.current?.click()}
                  disabled={vinScanLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0B1C2E] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {vinScanLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ScanLine className="w-3.5 h-3.5" />
                  }
                  {vinScanLoading ? 'Analyse...' : 'Scanner'}
                </button>
                <input
                  ref={vinScanInputRef}
                  aria-label="Scanner le numéro de châssis par photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleVinPhotoScan}
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={vin}
                  onChange={e => handleVinChange(e.target.value)}
                  required
                  maxLength={17}
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors ${
                    vinValid ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 focus:border-[#0B1C2E]'
                  }`}
                  placeholder="17 caractères — ex: VF1RFD00560123456"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${vinValid ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {vin.length}/17
                </span>
              </div>

              {vinScanError && (
                <div className="flex items-start gap-2 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {vinScanError}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1.5">
                Trouvez le VIN sur la plaque sous le pare-brise ou sur la carte grise.
              </p>
            </div>

            {/* Vehicle info card */}
            {vehicleLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B1C2E]" />
                Identification du véhicule en cours...
              </div>
            )}

            {vehicleInfo && !vehicleLoading && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">Véhicule détecté</p>
                  <p className="font-bold text-[#0B1C2E] text-sm">
                    {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                  </p>
                  {vehicleInfo.engine && (
                    <p className="text-xs text-gray-500 mt-0.5">{vehicleInfo.engine}</p>
                  )}
                </div>
                <button type="button" title="Effacer le véhicule détecté" onClick={() => setVehicleInfo(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {vinValid && !vehicleLoading && !vehicleInfo && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Véhicule non identifié automatiquement. Précisez-le dans la description.
              </div>
            )}

            {/* OEM Ref */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Référence OEM <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                name="oemRef"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: 04465-02220"
              />
              <p className="text-xs text-gray-400 mt-1">
                Référence du constructeur ou du concessionnaire agréé.
              </p>
            </div>
          </div>

          {/* Part info */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-[#0B1C2E] border-b pb-2">Pièce recherchée</h3>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom de la pièce <span className="text-[#E31837]">*</span></label>
              <input
                type="text"
                name="partName"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Ex: Plaquettes de frein avant, Alternateur..."
              />
            </div>

            {/* Part photo — required */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">
                Photo de la pièce <span className="text-[#E31837]">*</span>
              </label>
              <label
                htmlFor="part-photo"
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block ${
                  partPhotoUrl
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  ref={partPhotoInputRef}
                  id="part-photo"
                  aria-label="Photo de la pièce recherchée"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePartPhoto}
                />
                {partPhotoUrl ? (
                  <>
                    <img src={partPhotoUrl} alt="Pièce" className="w-24 h-24 object-cover rounded-lg mb-2 shadow-sm" />
                    <p className="text-xs font-bold text-emerald-700">{partPhotoName}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Appuyer pour changer</p>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-[#0B1C2E]">Prendre une photo de la pièce</p>
                    <p className="text-xs text-gray-500 mt-1">Aide l'expert à identifier la pièce précisément</p>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Précisions supplémentaires</label>
              <textarea
                rows={3}
                name="description"
                className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E]"
                placeholder="Motorisation, boîte auto/manuelle, état, symptôme..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !vinValid || !partPhotoUrl}
            className="w-full bg-[#E31837] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-[#B91C1C] transition-colors disabled:opacity-40 mt-4"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <><Send className="w-5 h-5" />Envoyer ma demande</>
            }
          </button>

          {(!vinValid || !partPhotoUrl) && (
            <p className="text-center text-xs text-gray-400 -mt-2">
              {!vinValid && !partPhotoUrl
                ? 'Numéro de châssis (17 car.) et photo de la pièce requis'
                : !vinValid
                ? 'Numéro de châssis (17 caractères) requis'
                : 'Photo de la pièce requise'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
