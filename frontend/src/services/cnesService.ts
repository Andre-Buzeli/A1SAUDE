export async function listarProfissionaisCNES() {
  const res = await fetch('/api/v1/integrations/cnes/profissionais');
  if (!res.ok) throw new Error('Falha CNES');
  return (await res.json()).data;
}

export async function listarEstruturaCNES() {
  const res = await fetch('/api/v1/integrations/cnes/estrutura');
  if (!res.ok) throw new Error('Falha CNES');
  return (await res.json()).data;
}
