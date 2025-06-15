
export default function LandingFooter() {
  return (
    <footer className="bg-primary text-dm-text py-10 px-6 border-t border-secondary/30 relative min-h-[135px]">
      {/* Motif africain : supprimé, design épuré */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <img src="/favicon.ico" alt="OneLog Africa logo" className="h-7 w-7 rounded" />
          <span className="text-lg font-bold font-montserrat text-secondary select-none">OneLog Africa</span>
        </div>
        <div className="text-sm flex flex-col items-center md:items-end gap-1 text-dm-text/90 opacity-90">
          <span>
            On échange ?{" "}
            <a href="mailto:contact@onelog.africa" className="underline hover:text-fresh ml-1 font-semibold">
              contact@onelog.africa
            </a>
          </span>
          <span>© {new Date().getFullYear()} OneLog Africa. Tous droits réservés.</span>
          <span>
            <a href="https://twitter.com/" className="hover:text-secondary mx-1" aria-label="Twitter">Twitter</a>
            ·
            <a href="https://linkedin.com/" className="hover:text-secondary mx-1" aria-label="LinkedIn">LinkedIn</a>
          </span>
        </div>
      </div>
      {/* Bandeau dégradé de closing */}
      <div className="absolute left-0 bottom-0 w-full h-6 pointer-events-none" style={{
        background: "linear-gradient(to top,#1A3C40 60%,#F9A82500)",
        borderBottomLeftRadius: "18px",
        borderBottomRightRadius: "18px",
        opacity: 0.96
      }} />
    </footer>
  );
}
