
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Depuis OneLog, nos chauffeurs sont plus efficaces et nos clients mieux informés. C’est un vrai tournant.",
    author: "Mariam Koné",
    title: "COO FasoTrans",
    country: "Burkina Faso",
  },
  {
    quote:
      "La solution est rapide, locale et pensée pour le terrain. Le support nous parle notre langue.",
    author: "Eric N’Guessan",
    title: "Directeur logistique IvoireTrack",
    country: null,
  },
  {
    quote:
      "On pensait qu’il fallait un gros budget pour digitaliser... On s’est trompés !",
    author: "Jean-Paul Ngoma",
    title: "Responsable transport",
    country: "Douala",
  },
];

export default function LandingTestimonials() {
  return (
    <section
      className="w-full bg-[#fff] border-b border-gray-100 py-14 md:py-20 px-3 sm:px-5 md:px-12 flex flex-col items-center"
      aria-labelledby="testimonials-title"
    >
      <h2
        id="testimonials-title"
        className="font-montserrat font-extrabold text-2xl md:text-3xl mb-10 flex items-center gap-2 text-[#E65100]"
      >
        <span className="text-2xl md:text-3xl">🧑🏾‍💼</span>
        Nos clients témoignent
      </h2>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <blockquote
            key={t.author}
            className="relative bg-[#f9fafb] border border-[#F9A825]/15 rounded-2xl p-7 shadow-sm flex flex-col gap-4 animate-fade-in"
            style={{ animationDelay: `${0.09 + i * 0.13}s` }}
          >
            <Quote
              size={34}
              className="absolute -top-5 left-4 text-[#F9A825]/70 opacity-60"
              aria-label="quote"
            />
            <p className="font-medium italic text-[#1A3C40] mb-2 text-base md:text-lg leading-relaxed">
              “{t.quote}”
            </p>
            <footer className="mt-2 flex flex-col gap-0 text-sm md:text-base font-semibold text-[#E65100]">
              <span>
                — {t.author}
                {t.country && (
                  <span className="font-normal text-[#009688] ml-1">
                    ({t.country})
                  </span>
                )}
              </span>
              <span className="font-normal text-[#263238]">{t.title}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
