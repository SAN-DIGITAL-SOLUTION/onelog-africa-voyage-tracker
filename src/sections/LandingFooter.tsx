
export default function LandingFooter() {
  return (
    <footer className="bg-primary text-dm-text py-8 px-6 border-t border-secondary/30 relative">
      {/* Motif africain supprimé */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <img src="/favicon.ico" alt="OneLog Africa logo" className="h-7 w-7 rounded" />
          <span className="text-lg font-bold font-montserrat text-secondary">OneLog Africa</span>
        </div>
        <div className="text-sm flex flex-col items-center md:items-end gap-2 text-dm-text/90">
          <span>
            Contact :
            <a href="mailto:contact@onelog.africa" className="underline hover:text-fresh ml-1">contact@onelog.africa</a>
          </span>
          <span>© 2025 OneLog Africa. Tous droits réservés.</span>
          <span>
            <a href="https://twitter.com/" className="hover:text-secondary mx-1" aria-label="Twitter">Twitter</a>
            ·
            <a href="https://linkedin.com/" className="hover:text-secondary mx-1" aria-label="LinkedIn">LinkedIn</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

