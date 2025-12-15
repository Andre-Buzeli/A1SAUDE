export async function listarVacinas() {
  const res = await fetch('/api/v1/integrations/sipni/vacinas');
  if (!res.ok) throw new Error('Falha SI-PNI');
  return (await res.json()).data;
}

export async function registrarVacina(payload: { patientId: string; vaccineCode: string; dose: string; date?: string }) {
  const res = await fetch('/api/v1/integrations/sipni/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Falha SI-PNI');
  return (await res.json()).data;
}
