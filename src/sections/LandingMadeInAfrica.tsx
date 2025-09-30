
import React from "react";

export default function LandingMadeInAfrica() {
  return (
    <section
      className="relative w-full bg-[#fff] border-b border-gray-100 py-14 md:py-24 px-3 sm:px-5 md:px-12 flex flex-col items-center overflow-hidden"
      aria-labelledby="made-in-africa-title"
    >
      {/* Dégradé animé fond section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full animate-african-gradient"
          style={{
            background:
              "radial-gradient(circle at 65% 60%, #F9A82555 0%, #F9A82519 42%, #FFDAA733 70%, #FFF8F0 100%)",
            filter: "blur(25px) brightness(1.05)",
            opacity: 0.75,
            animation: "african-gradient-move 12s ease-in-out infinite alternate"
          }}
        />
      </div>
      <div className="w-full max-w-6xl flex flex-col-reverse md:flex-row items-center md:items-stretch gap-10 md:gap-16 z-10 relative">
        {/* Bloc texte */}
        <div className="flex-1 flex flex-col justify-center md:justify-start">
          <h2
            id="made-in-africa-title"
            className="font-montserrat font-extrabold text-2xl md:text-3xl mb-4 flex items-center gap-2 text-[#E65100]"
          >
            <span className="text-2xl md:text-3xl">🌍</span>
            Made In Africa
          </h2>
          <h3 className="font-montserrat font-bold text-xl md:text-2xl mb-3 text-[#1A3C40]">
            Notre force c&apos;est notre ancrage
          </h3>
          <ul className="mb-6 space-y-2 md:text-lg text-base font-semibold text-[#263238] pl-0">
            <li>
              <span className="mr-2">🇨🇮</span>
              Conçu et testé sur le terrain, <b>OneLog Africa</b> s’adapte aux réalités africaines : routes, réseaux, douanes, habitudes terrain.
            </li>
            <li>
              <span className="mr-2">🚛</span>
              De l’artisan exportateur au grand logisticien, nous connectons les opérateurs de la nouvelle Afrique.
            </li>
            <li>
              <span className="mr-2">🤝</span>
              Une plateforme panafricaine, locale et fière de l’être.
            </li>
          </ul>
          <p className="mt-3 font-medium italic text-[#1A3C40] text-base md:text-lg">
            « Assez des solutions pensées ailleurs. Il est temps de tracer notre propre route. »
          </p>
        </div>
        {/* Bloc image */}
        <div className="flex-1 flex items-center justify-center mb-7 md:mb-0">
          <img
            src="/lovable-uploads/91fd0505-b323-44ce-8632-1456882003e9.png"
            alt="Carte de l'Afrique avec camion - Made in Africa"
            className="w-full max-w-[420px] rounded-2xl shadow-lg border border-gray-100 animate-fade-in"
          />
        </div>
      </div>
    </section>
  );
}
