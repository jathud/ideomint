import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS resolvers are configured for c-ares (Google & Cloudflare)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore
}

/**
 * Custom DNS lookup for Mongoose/MongoDB Node driver.
 * Uses c-ares dns.resolve4 for *.mongodb.net hostnames to bypass local system getaddrinfo DNS ENOTFOUND.
 */
function customLookup(
  hostname: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: any
) {
  let cb = callback;
  let opts: dns.LookupOptions = {};

  if (typeof options === 'function') {
    cb = options;
  } else if (options) {
    opts = options;
  }

  if (!cb) return;
  const finalCb = cb;

  if (typeof hostname === 'string' && hostname.includes('mongodb.net')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        dns.lookup(hostname, opts, finalCb);
      } else {
        if (opts.all) {
          finalCb(null, addresses.map((a) => ({ address: a, family: 4 })));
        } else {
          finalCb(null, addresses[0], 4);
        }
      }
    });
  } else {
    dns.lookup(hostname, opts, finalCb);
  }
}

// ── Mongoose Connection Cache ─────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  let MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn('[MongoDB] MONGODB_URI is not set. Supabase is the primary database.');
    return null;
  }
  if (cached.conn) return cached.conn;

  // Auto-convert homestack mongodb+srv:// to direct seedlist if needed
  if (MONGODB_URI.includes('mongodb+srv://') && MONGODB_URI.includes('homestack')) {
    MONGODB_URI = MONGODB_URI.replace(
      'mongodb+srv://homeStack:0000@homestack.iklhp.mongodb.net/',
      'mongodb://homeStack:0000@homestack-shard-00-00.iklhp.mongodb.net:27017,homestack-shard-00-01.iklhp.mongodb.net:27017,homestack-shard-00-02.iklhp.mongodb.net:27017/'
    );
    if (!MONGODB_URI.includes('replicaSet=')) {
      const joinChar = MONGODB_URI.includes('?') ? '&' : '?';
      MONGODB_URI += `${joinChar}ssl=true&replicaSet=atlas-1120ny-shard-0&authSource=admin`;
    }
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lookup: customLookup as any,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      family: 4,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset promise on error so next call retries
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
