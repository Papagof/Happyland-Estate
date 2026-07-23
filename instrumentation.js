export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const sharp = (await import('sharp')).default;
    sharp.block({ operation: ['VipsForeignLoadNsgif', 'VipsForeignLoadTiff', 'VipsForeignLoadVips'] });
  }
}
