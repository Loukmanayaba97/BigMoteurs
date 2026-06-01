import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Landmark, Store, Download, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { jsPDF } from 'jspdf';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOMO' | 'WIRE' | 'CASH'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const selectedLocation = localStorage.getItem('rp_location') || 'Mali, Benin';
  const isMali = selectedLocation.includes('Mali');

  // Redirection if empty or not logged in
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#0B1C2E] mb-2">Panier vide</h2>
        <button onClick={() => navigate('/search')} className="text-[#B91C1C] font-medium">Parcourir les pièces</button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Création de la commande
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            unitPrice: i.price
          }))
        })
      });

      if (!orderRes.ok) throw new Error('Erreur lors de la création de la commande');
      const { order } = await orderRes.json();

      // 2. Simulation de l'initiation de paiement
      const payRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          method: paymentMethod
        })
      });

      if (!payRes.ok) throw new Error('Erreur lors du paiement');

      // 3. Simuler l'envoi d'un mail à l'administrateur
      console.log("=== SIMULATION ENVOI EMAIL COMMANDE (NODEMAILER) ===");
      console.log("To: admin@rapidpieces.ci");
      console.log(`Subject: 🛒 Nouvelle commande confirmée - #${order.id || 'ORDER'} `);
      console.log("Body:");
      console.log(`Un client a passé une nouvelle commande.`);
      console.log(`- Client : ${user.name} (${user.email})`);
      console.log(`- Nb articles : ${items.length}`);
      console.log(`- Total : ${getTotal() + 2500} FCFA`);
      console.log(`- Méthode paiement : ${paymentMethod}`);
      console.log("==================================================");

      setOrderSuccess(true);
      // We don't clear the cart immediately here so the PDF generator can access it,
      // or we clear it when the component unmounts, or we can just leave it cleared after.
      // Actually it's better to clone the items for the PDF before clearing.
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Reçu de Commande - RapidPièces", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Client : ${user?.name || 'Inconnu'}`, 20, 35);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 20, 42);
    doc.text(`Paiement : ${paymentMethod}`, 20, 49);

    doc.setFont("helvetica", "bold");
    doc.text("Articles :", 20, 65);
    
    doc.setFont("helvetica", "normal");
    let y = 75;
    items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.title} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString()} FCFA`, 20, y);
      y += 10;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Frais de livraison : 2 500 FCFA`, 20, y);
    y += 10;
    doc.setFontSize(16);
    doc.text(`Total : ${(getTotal() + 2500).toLocaleString()} FCFA`, 20, y);

    doc.save("recu_commande_rapidpieces.pdf");
  };

  const handleFinish = () => {
    clearCart();
    navigate('/');
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B1C2E] mb-2">Commande Réussie !</h2>
          <p className="text-gray-500 mb-6">Votre commande a été confirmée et est en cours de préparation.</p>
          
          <button 
            onClick={generatePDF}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-full font-bold mb-3 hover:bg-gray-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            Télécharger le reçu (PDF)
          </button>
          
          <button 
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-[#0B1C2E] py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-2xl shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#0B1C2E]" />
          </button>
          <h2 className="text-2xl font-bold text-[#0B1C2E]">Validation Commande</h2>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Adresse Livraison (Simulée) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-[#0B1C2E] mb-3">Adresse de livraison</h3>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="font-bold text-sm text-[#0B1C2E]">{user?.name || 'Client'}</p>
            {isMali ? (
              <>
                <p className="text-sm text-gray-600 mt-1">Zone Industrielle, Rue 14</p>
                <p className="text-sm text-gray-600">Mali, Benin</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mt-1">Avenue Steinmetz, Lot 102</p>
                <p className="text-sm text-gray-600">Cotonou, Bénin</p>
              </>
            )}
            <button className="text-xs text-[#B91C1C] font-medium mt-3">Modifier l'adresse</button>
          </div>
        </div>

        {/* Moyens de Paiement */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-[#0B1C2E] mb-4">Moyen de paiement</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setPaymentMethod('MOMO')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'MOMO' ? 'border-[#B91C1C] bg-red-50' : 'border-gray-100 bg-white'
              }`}
            >
              <Smartphone className={paymentMethod === 'MOMO' ? 'text-[#B91C1C]' : 'text-gray-400'} />
              <span className="text-xs font-bold text-[#0B1C2E]">Mobile Money</span>
            </button>
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'CARD' ? 'border-[#0B1C2E] bg-slate-50' : 'border-gray-100 bg-white'
              }`}
            >
              <CreditCard className={paymentMethod === 'CARD' ? 'text-[#0B1C2E]' : 'text-gray-400'} />
              <span className="text-xs font-bold text-[#0B1C2E]">Carte Bancaire</span>
            </button>
            <button
              onClick={() => setPaymentMethod('WIRE')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'WIRE' ? 'border-[#0B1C2E] bg-slate-50' : 'border-gray-100 bg-white'
              }`}
            >
              <Landmark className={paymentMethod === 'WIRE' ? 'text-[#0B1C2E]' : 'text-gray-400'} />
              <span className="text-xs font-bold text-[#0B1C2E]">Virement</span>
            </button>
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'CASH' ? 'border-[#0B1C2E] bg-slate-50' : 'border-gray-100 bg-white'
              }`}
            >
              <Store className={paymentMethod === 'CASH' ? 'text-[#0B1C2E]' : 'text-gray-400'} />
              <span className="text-xs font-bold text-[#0B1C2E]">À la caisse</span>
            </button>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-900 text-white text-[10px] font-bold px-2 py-1 rounded italic">VISA</div>
                <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded italic flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -mr-1 mix-blend-multiply flex-shrink-0"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mix-blend-multiply flex-shrink-0"></div>
                  <span className="ml-1">mastercard</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    maxLength={19}
                    className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Date d'expiration</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    maxLength={5}
                    className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    maxLength={4}
                    className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom sur la carte</label>
                <input 
                  type="text" 
                  placeholder="Ex: John Doe"
                  className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B1C2E] font-medium placeholder-gray-400 uppercase"
                />
              </div>
            </div>
          )}
          
          {paymentMethod === 'MOMO' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Numéro Mobile Money (Wave, Orange, MTN, Moov...)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Ex: 01 02 03 04 05" 
                      className="w-full bg-gray-50 border border-gray-200 text-[#0B1C2E] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#B91C1C] font-medium placeholder-gray-400"
                    />
                  </div>
               </div>
            </div>
          )}

          {paymentMethod === 'WIRE' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-sm text-[#0B1C2E] mb-2">Instructions de virement</h4>
                  <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                    Veuillez effectuer le virement sur le compte bancaire suivant. Votre commande sera traitée dès réception des fonds.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Banque:</span><span className="font-bold text-[#0B1C2E]">{isMali ? 'BDM (Banque de Développement du Mali)' : 'BOA Bénin (Bank of Africa)'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Titulaire:</span><span className="font-bold text-[#0B1C2E]">RapidPièces SARL</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">IBAN/RIB:</span><span className="font-bold text-[#0B1C2E] font-mono">{isMali ? 'ML09 6012 3456 7890 1234 56' : 'BJ06 2013 4567 8901 2345 67'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">BIC/SWIFT:</span><span className="font-bold text-[#0B1C2E] font-mono">{isMali ? 'BDMAMLM1' : 'BOABJBJ1'}</span></div>
                  </div>
               </div>
            </div>
          )}

          {paymentMethod === 'CASH' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h4 className="font-bold text-sm text-[#0B1C2E] mb-2">Paiement à la caisse</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Vous avez choisi de régler votre commande directement dans notre boutique.
                  </p>
                  <div className="mt-3 bg-white p-3 rounded-lg border border-orange-100 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0B1C2E] block">Boutique Principale RapidPièces</span>
                        {isMali ? (
                          <span className="text-gray-500">Quartier du Fleuve, Avenue Modibo Keïta<br/>Mali, Benin</span>
                        ) : (
                          <span className="text-gray-500">Gbégamey, Place Bulgarie<br/>Cotonou, Bénin</span>
                        )}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-lg text-[#0B1C2E] mb-4">Résumé ({items.length} articles)</h3>
           <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Sous-total</span>
                 <span className="font-medium text-[#0B1C2E]">{getTotal().toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Frais de livraison</span>
                 <span className="font-medium text-[#0B1C2E]">2.500 FCFA</span>
              </div>
           </div>
           <div className="h-px bg-gray-100 w-full mb-4"></div>
           <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-[#0B1C2E]">Total</span>
              <span className="text-2xl font-extrabold text-[#B91C1C]">{(getTotal() + 2500).toLocaleString()} <span className="text-sm">FCFA</span></span>
           </div>

           <button
             onClick={handleCheckout}
             disabled={isProcessing}
             className="w-full bg-[#B91C1C] hover:bg-[#c41530] text-white py-4 rounded-full font-bold text-lg shadow-md transition-all disabled:opacity-50"
           >
             {isProcessing ? 'Traitement...' : user ? 'Payer la commande' : 'Se connecter pour payer'}
           </button>
        </div>
      </div>
    </div>
  );
}
