import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Contact, RoleType } from '@/types/bdr';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => Promise<void>;
}

interface ParsedContact {
  name: string;
  company: string;
  role: RoleType;
  address?: string;
  website?: string;
  status?: string;
  lastTouch?: string;
  valid: boolean;
  error?: string;
}

const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

const mapRole = (type: string): RoleType => {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('architect')) return 'Architect';
  if (normalized.includes('builder') || normalized === 'gc') return 'Builder';
  if (normalized.includes('interior')) return 'Interior Designer';
  if (normalized.includes('landscape')) return 'Landscape Designer';
  if (normalized.includes('real estate')) return 'Real Estate Advisor';
  return 'Other';
};

const mapStatus = (status: string): 'new-relationship' | 'active-healthy' | 'under-engaged' => {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'engaged' || normalized === 'warm') return 'active-healthy';
  if (normalized === 'cold') return 'under-engaged';
  return 'new-relationship';
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  // Try to parse various date formats
  const normalized = dateStr.trim().toLowerCase();
  
  // Handle formats like "Fall 2025", "Summer 2025", "~2024"
  const seasonMatch = normalized.match(/(fall|summer|spring|winter)\s*(\d{4})/i);
  if (seasonMatch) {
    const [, season, year] = seasonMatch;
    const monthMap: Record<string, string> = {
      spring: '03', summer: '06', fall: '09', winter: '12'
    };
    return `${year}-${monthMap[season.toLowerCase()]}-01`;
  }
  
  // Handle ~year or year format
  const yearMatch = normalized.match(/~?(\d{4})/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }
  
  // Handle M.D.YY format like "1.5.26"
  const mdyMatch = normalized.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
};

export const ImportContactsDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportContactsDialogProps) => {
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        setParsedContacts([]);
        return;
      }

      // Find header row
      const headers = rows[0].map(h => h.toLowerCase());
      const specifierIdx = headers.findIndex(h => h.includes('specifier') || h.includes('company'));
      const typeIdx = headers.findIndex(h => h === 'type' || h.includes('role'));
      const addressIdx = headers.findIndex(h => h.includes('address'));
      const contactIdx = headers.findIndex(h => h.includes('contact') || h.includes('name'));
      const websiteIdx = headers.findIndex(h => h.includes('website'));
      const statusIdx = headers.findIndex(h => h.includes('status'));
      const lastIdx = headers.findIndex(h => h.includes('last'));

      const contacts: ParsedContact[] = rows.slice(1).map(row => {
        const company = row[specifierIdx] || '';
        const name = row[contactIdx] || '';
        const type = row[typeIdx] || '';
        const address = addressIdx >= 0 ? row[addressIdx] : undefined;
        const website = websiteIdx >= 0 ? row[websiteIdx] : undefined;
        const status = statusIdx >= 0 ? row[statusIdx] : undefined;
        const lastTouch = lastIdx >= 0 ? row[lastIdx] : undefined;

        const valid = !!company && !!name;
        const error = !valid ? 'Missing company or contact name' : undefined;

        return {
          company,
          name: name.split(',')[0].trim(), // Take first contact if multiple
          role: mapRole(type),
          address,
          website: website?.replace(/<|>/g, '').split(/\s+/)[0], // Clean up URLs
          status,
          lastTouch,
          valid,
          error,
        };
      }).filter(c => c.company || c.name); // Filter out empty rows

      setParsedContacts(contacts);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validContacts = parsedContacts.filter(c => c.valid);
    if (validContacts.length === 0) return;

    setIsImporting(true);
    try {
      const contactsToImport: Omit<Contact, 'id' | 'createdAt'>[] = validContacts.map(c => ({
        name: c.name,
        company: c.company,
        role: c.role,
        relationshipType: 'Active Partner',
        lastTouchDate: parseDate(c.lastTouch || ''),
        nextTouchDate: null,
        statusNotes: '',
        relationshipStrength: c.status?.toLowerCase() === 'engaged' ? 3 : 1,
        tags: [],
        board: 'active' as const,
        stage: mapStatus(c.status || ''),
        address: c.address,
        website: c.website,
      }));

      await onImport(contactsToImport);
      setParsedContacts([]);
      setFileName(null);
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setParsedContacts([]);
    setFileName(null);
    onOpenChange(false);
  };

  const validCount = parsedContacts.filter(c => c.valid).length;
  const invalidCount = parsedContacts.filter(c => !c.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Active Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: Specifier, Type, Address, Main Contact, Website, Status, Last
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="mt-2">
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {fileName || 'Choose CSV file...'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {parsedContacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {invalidCount} invalid
                  </span>
                )}
              </div>

              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-3 space-y-2">
                  {parsedContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm ${
                        contact.valid
                          ? 'bg-secondary/50'
                          : 'bg-destructive/10 border border-destructive/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-medium">{contact.company}</span>
                          <span className="text-muted-foreground"> • {contact.name}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {contact.role} • {contact.status || 'No status'}
                          </div>
                        </div>
                        {contact.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      {contact.error && (
                        <p className="text-xs text-destructive mt-1">{contact.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isImporting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isImporting ? 'Importing...' : `Import ${validCount} Contacts`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
