export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const sharp = (await import('sharp')).default;
      sharp.block({ operation: ['VipsForeignLoadNsgif', 'VipsForeignLoadTiff', 'VipsForeignLoadVips'] });
    } catch (err) {
      // Best-effort hardening only — must never take the server down if the
      // platform's sharp/libvips build doesn't recognize one of these loaders.
      console.error('instrumentation: sharp.block() failed, continuing without it:', err);
    }
  }
}
