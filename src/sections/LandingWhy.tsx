
import { CheckCircle2, XCircle } from "lucide-react";

export default function LandingWhy() {
  return (
    <section className="w-full flex flex-col items-center bg-[#fff] py-12 md:py-20 px-3 sm:px-5 md:px-12 border-b border-gray-100">
      <h2 className="font-montserrat text-2xl md:text-3xl font-extrabold mb-8 flex items-center gap-2 text-[#E65100]">
        <span className="text-2xl md:text-3xl">❗</span>
        Pourquoi <span className="text-[#1A3C40]">OneLog Africa</span> est différent&nbsp;?
      </h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-14 w-full max-w-4xl">
        {/* Avant */}
        <div className="flex-1 bg-[#F4F4F4] rounded-xl p-6 md:p-7 shadow-sm border border-gray-200 min-h-[220px]">
          <div className="flex items-center gap-2 mb-4 text-[#cf4847] font-bold text-lg">
            <XCircle size={24} strokeWidth={2} className="text-[#cf4847]" />
            <span>Avant :</span>
          </div>
          <ul className="pl-0 text-left text-base md:text-lg font-semibold space-y-1 text-[#263238]">
            <li className="flex gap-2 items-start"><span>•</span> Zéro visibilité.</li>
            <li className="flex gap-2 items-start"><span>•</span> Des délais à rallonge.</li>
            <li className="flex gap-2 items-start"><span>•</span> Une gestion papier éparpillée.</li>
            <li className="flex gap-2 items-start"><span>•</span> Clients et partenaires frustrés.</li>
          </ul>
        </div>
        {/* Maintenant */}
        <div className="flex-1 bg-[#f9fafb] rounded-xl p-6 md:p-7 shadow-sm border border-[#F9A825]/60 min-h-[220px]">
          <div className="flex items-center gap-2 mb-4 text-[#009688] font-bold text-lg">
            <CheckCircle2 size={24} strokeWidth={2} className="text-[#009688]" />
            <span>Maintenant&nbsp;:</span>
          </div>
          <ul className="pl-0 text-left text-base md:text-lg font-semibold space-y-2 text-[#1a3c40]">
            <li>
              <span className="font-semibold text-[#F9A825]">Avec OneLog Africa</span>, chaque trajet, colis et document est suivi, sécurisé et valorisé.
            </li>
            <li>
              Un back-office moderne, pensé pour les routes africaines, <b>avec ou sans connexion</b>.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
