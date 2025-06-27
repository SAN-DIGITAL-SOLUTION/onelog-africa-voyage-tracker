import React from "react";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-between px-4 py-3 border-t bg-white dark:bg-onelog-nuit">
      <div className="flex items-center gap-2">
        <img src="/onelog-africa-logo-dark.png" alt="Logo OneLog Africa" style={{height:'24px', width:'auto', display:'block'}} />
        <span className="text-sm font-bold tracking-tight" style={{color: '#1A3C40'}}>OneLog <span style={{color: '#F9A825'}}>Africa</span></span>
      </div>
      <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} OneLog Africa. Tous droits réservés.</span>
    </footer>
  );
}
