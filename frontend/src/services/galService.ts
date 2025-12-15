export async function listarPedidosGAL() {
  const res = await fetch('/api/v1/integrations/gal/orders');
  if (!res.ok) throw new Error('Falha GAL');
  return (await res.json()).data;
}

export async function enviarResultadoGAL(orderId: string, results: any) {
  const res = await fetch('/api/v1/integrations/gal/push-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, results })
  });
  if (!res.ok) throw new Error('Falha GAL');
  return (await res.json()).data;
}
