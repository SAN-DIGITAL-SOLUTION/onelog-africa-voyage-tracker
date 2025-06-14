
import React, { createContext, useContext, useState, useCallback } from "react";

export type AppRole = "admin" | "exploiteur" | "chauffeur" | null;

type RoleContextType = {
  role: AppRole;
  setRole: (role: AppRole) => void;
  loadingRole: boolean;
  setLoadingRole: (v: boolean) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>(null);
  const [loadingRole, setLoadingRole] = useState<boolean>(false);

  return (
    <RoleContext.Provider value={{ role, setRole, loadingRole, setLoadingRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole doit être utilisé dans RoleProvider");
  return ctx;
}
