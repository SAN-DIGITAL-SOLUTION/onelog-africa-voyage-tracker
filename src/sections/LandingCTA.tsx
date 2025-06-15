
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingCTA() {
  return (
    <section
      className="w-full bg-[#fff8f0] border-b border-[#F9A825]/15 py-14 md:py-20 px-3 sm:px-5 md:px-12 flex flex-col items-center animate-fade-in"
      aria-labelledby="cta-title"
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-7">
        <h2
          id="cta-title"
          className="font-montserrat font-extrabold text-2xl md:text-3xl flex items-center gap-2 text-[#E65100]"
        >
          <span className="text-2xl md:text-3xl">🚀</span>
          Rejoignez les pionniers
        </h2>
        <p className="text-lg md:text-xl font-semibold text-[#1A3C40]">
          🎉 Vous êtes <span className="text-[#009688]">transporteur</span>, <span className="text-[#009688]">logisticien</span>, <span className="text-[#009688]">commerçant</span> ?
          <br />
          👉 Passez à <span className="text-accent font-extrabold">OneLog Africa</span> et maîtrisez enfin vos opérations logistiques.
        </p>
        <Button
          size="lg"
          className="btn-cta flex items-center gap-2 bg-[#F9A825] text-[#fff] shadow-cta animate-cta-pulse ring-2 ring-[#F9A825]/30 transition-transform duration-150 hover:scale-105 hover:brightness-110 focus:scale-[1.04]"
          style={{
            boxShadow: "0 0 0 0 #F9A82544, 0 4px 24px 0 #F9A82544",
            textShadow: "0 2px 6px #E6510025",
          }}
        >
          👉 Je teste gratuitement maintenant
          <ArrowRight className="ml-1" size={22} />
        </Button>
        <div className="flex flex-col items-center gap-0.5 mt-2">
          <span className="text-[#009688] font-bold text-base flex items-center gap-1">
            🔐 Sécurisé. Simple. 100% africain.
          </span>
          <span className="text-[#263238]/80 text-sm">
            ✉️ Un conseiller local vous accompagne à chaque étape.
          </span>
        </div>
      </div>
    </section>
  );
}
