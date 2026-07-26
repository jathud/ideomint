export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('dns');
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      dns.setDefaultResultOrder('ipv4first');
    } catch {
      // Ignore
    }
  }
}
