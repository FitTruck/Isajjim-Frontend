export function parseQueryString(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  qs.replace(/^\?/, '').split('&').forEach(pair => {
    if (!pair) return;
    const [k, v = ''] = pair.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  });
  return out;
}
