
import React from "react";

export default function LandingMadeInAfrica() {
  return (
    <section
      className="w-full bg-[#fff] border-b border-gray-100 py-14 md:py-24 px-3 sm:px-5 md:px-12 flex flex-col items-center"
      aria-labelledby="made-in-africa-title"
    >
      <div className="w-full max-w-6xl flex flex-col-reverse md:flex-row items-center md:items-stretch gap-10 md:gap-16">
        {/* Bloc texte */}
        <div className="flex-1 flex flex-col justify-center md:justify-start">
          <h2
            id="made-in-africa-title"
            className="font-montserrat font-extrabold text-2xl md:text-3xl mb-4 flex items-center gap-2 text-[#E65100]"
          >
            <span className="text-2xl md:text-3xl">🌍</span>
            Section “Made in Africa” — <span className="text-[#1A3C40]">Notre force, c’est notre ancrage</span>
          </h2>
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
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
