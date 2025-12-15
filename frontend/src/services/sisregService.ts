export async function solicitarTransferencia(payload: { patientId: string; destination: string; priority?: string; documents?: any[] }) {
  const res = await fetch('/api/v1/integrations/sisreg/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Falha SISREG');
  return (await res.json()).data;
}
