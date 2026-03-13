import { Home, Radio } from 'lucide-react';
import { useOrganization, OrganizationType } from '@/contexts/OrganizationContext';

const CompanySelector = () => {
  const { setCurrentOrg } = useOrganization();

  const companies: { id: OrganizationType; name: string; icon: typeof Home; bgClass: string }[] = [
    { id: 'rhome', name: 'r:home', icon: Home, bgClass: 'bg-primary' },
    { id: 'sync-systems', name: 'Sync Systems', icon: Radio, bgClass: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Disclaimer Banner */}
      <div className="bg-destructive text-destructive-foreground text-center py-4 px-6 font-bold text-lg tracking-wide">
        <p className="text-2xl mb-1">⚠️ DO NOT USE — TRESPASSERS WILL BE VIOLATED ⚠️</p>
        <p className="text-base font-medium">
          PLEASE USE THIS LINK:{' '}
          <a href="https://rhomebdr.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            rhomebdr.vercel.app
          </a>
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">BDR Hub</h1>
          <p className="text-muted-foreground mt-2">Select your company to get started</p>
        </div>

        <div className="flex gap-6">
          {companies.map(({ id, name, icon: Icon, bgClass }) => (
            <button
              key={id}
              onClick={() => setCurrentOrg(id)}
              className="group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 w-52"
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${bgClass}`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
