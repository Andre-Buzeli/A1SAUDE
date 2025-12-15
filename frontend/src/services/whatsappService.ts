export async function enviarWhatsApp(to: string, message: string): Promise<{ to: string; status: string }> {
  const res = await fetch('/api/v1/integrations/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message })
  });
  if (!res.ok) throw new Error('Falha ao enviar WhatsApp');
  const json = await res.json();
  return json.data;
}
