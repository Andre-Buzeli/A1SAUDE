export function maskCPF(cpf: string): string {
  const digits = (cpf || '').replace(/\D/g, '').padStart(11, '*');
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11).replace(/\d/g, '*')}`;
}

export function maskEmail(email: string): string {
  const [user, domain] = String(email || '').split('@');
  if (!domain) return '***';
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${'*'.repeat(Math.max(0, user.length - visible.length))}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 8) return '********';
  return `${digits.slice(0,2)} ${digits.slice(2,7).replace(/\d/g, '*')}-${digits.slice(7)}`;
}

export function maskPayload<T extends Record<string, any>>(obj: T, keys: string[] = ['cpf','email','telefone','phone']): T {
  const out: any = { ...obj };
  for (const k of keys) {
    if (out[k] !== undefined && out[k] !== null) {
      if (k === 'cpf') out[k] = maskCPF(String(out[k]));
      else if (k === 'email') out[k] = maskEmail(String(out[k]));
      else out[k] = maskPhone(String(out[k]));
    }
  }
  return out;
}
