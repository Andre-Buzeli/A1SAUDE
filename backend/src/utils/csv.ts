export function toCSV(rows: any[], columns?: string[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const header = cols.join(',');
  const body = rows.map(r => cols.map(c => formatCSVCell(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

function formatCSVCell(v: any): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
