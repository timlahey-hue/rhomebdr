import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OrganizationType = 'rhome' | 'sync-systems';

interface OrgDetails {
  id: OrganizationType;
  name: string;
  subtitle: string;
}

const ORG_MAP: Record<OrganizationType, OrgDetails> = {
  rhome: { id: 'rhome', name: 'r:home', subtitle: 'Relationship Builder' },
  'sync-systems': { id: 'sync-systems', name: 'Sync Systems', subtitle: 'Relationship Builder' },
};

interface OrganizationContextType {
  currentOrg: OrganizationType | null;
  setCurrentOrg: (org: OrganizationType) => void;
  clearOrg: () => void;
  orgDetails: OrgDetails | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const STORAGE_KEY = 'bdr-hub-org';

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentOrg, setCurrentOrgState] = useState<OrganizationType | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'rhome' || stored === 'sync-systems') ? stored : null;
  });

  const setCurrentOrg = (org: OrganizationType) => {
    localStorage.setItem(STORAGE_KEY, org);
    setCurrentOrgState(org);
  };

  const clearOrg = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentOrgState(null);
  };

  const orgDetails = currentOrg ? ORG_MAP[currentOrg] : null;

  return (
    <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg, clearOrg, orgDetails }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganization must be used within OrganizationProvider');
  return context;
};
