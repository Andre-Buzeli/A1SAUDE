export async function getMunicipiosByUF(uf: string): Promise<Array<{ id: number; nome: string }>> {
  const url = `/api/v1/integrations/ibge/municipios?uf=${encodeURIComponent(uf)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao obter municípios');
  const json = await res.json();
  return json.data || [];
}
