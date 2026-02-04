import { Contact, PROSPECT_COLUMNS, ACTIVE_COLUMNS } from '@/types/bdr';

const getStageTitle = (contact: Contact): string => {
  const columns = contact.board === 'prospect' ? PROSPECT_COLUMNS : ACTIVE_COLUMNS;
  const column = columns.find(c => c.id === contact.stage);
  return column?.title || contact.stage;
};

export const exportContactsToCSV = (contacts: Contact[], boardName: string) => {
  if (contacts.length === 0) return;

  // CSV headers matching the import format
  const headers = [
    'Company',
    'Contact Name',
    'Title',
    'Role',
    'Type',
    'Phone',
    'Email',
    'Address',
    'Website',
    'Company Type',
    'Status',
    'Last Touch',
    'Next Touch',
    'Relationship Strength',
    'Tags',
    'Stage',
    'Tier',
    'Notes',
    'Secondary Contact Name',
    'Secondary Contact Title',
    'Secondary Contact Phone',
    'Secondary Contact Email'
  ];

  const rows = contacts.map(contact => [
    contact.company,
    contact.name,
    contact.title || '',
    contact.role,
    contact.relationshipType,
    contact.phone || '',
    contact.email || '',
    contact.address || '',
    contact.website || '',
    contact.companyType || '',
    contact.relationshipType,
    contact.lastTouchDate || '',
    contact.nextTouchDate || '',
    contact.relationshipStrength.toString(),
    (contact.tags || []).join('; '),
    getStageTitle(contact),
    contact.tier?.toString() || '',
    contact.statusNotes || '',
    contact.secondaryContactName || '',
    contact.secondaryContactTitle || '',
    contact.secondaryContactPhone || '',
    contact.secondaryContactEmail || ''
  ]);

  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${boardName}-contacts-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
