export function toXLS(rows: any[], columns?: string[], sheetName = 'Relatorio'): string {
  if (!Array.isArray(rows) || rows.length === 0) return wrapXLS(sheetName, '', columns);
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const headerRow = cols.map(c => `<Cell><Data ss:Type="String">${escapeXml(c)}</Data></Cell>`).join('');
  const header = `<Row>${headerRow}</Row>`;
  const body = rows
    .map(r => `<Row>${cols.map(c => `<Cell><Data ss:Type="String">${escapeXml(formatCell(r[c]))}</Data></Cell>`).join('')}</Row>`) 
    .join('');
  return wrapXLS(sheetName, header + body, cols);
}

function wrapXLS(sheetName: string, rowsXml: string, columns?: string[]): string {
  const colsXml = (columns || []).map(() => '<Column ss:AutoFitWidth="1"/>').join('');
  return `<?xml version="1.0"?>\n` +
  `<?mso-application progid="Excel.Sheet"?>\n` +
  `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ` +
  `xmlns:o="urn:schemas-microsoft-com:office:office" ` +
  `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
  `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ` +
  `xmlns:html="http://www.w3.org/TR/REC-html40">` +
  `<Worksheet ss:Name="${escapeXml(sheetName)}">` +
  `<Table>${colsXml}${rowsXml}</Table>` +
  `</Worksheet>` +
  `</Workbook>`;
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatCell(v: any): string {
  if (v === null || v === undefined) return '';
  return typeof v === 'string' ? v : JSON.stringify(v);
}
