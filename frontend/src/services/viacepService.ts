export async function buscarEnderecoPorCEP(cep: string): Promise<any> {
  const clean = cep.replace(/\D/g, '');
  const url = `/api/v1/integrations/viacep/${encodeURIComponent(clean)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar CEP');
  const json = await res.json();
  return json.data;
}
