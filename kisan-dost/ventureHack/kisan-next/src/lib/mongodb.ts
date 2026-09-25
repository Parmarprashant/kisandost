import mongoose from 'mongoose';
import dns from 'dns';

// Node's bundled c-ares can fail to read the OS DNS config (seen on Windows)
// and falls back to 127.0.0.1, where nothing listens. That breaks the SRV
// lookup mongodb+srv:// requires, surfacing as `querySrv ECONNREFUSED`.
//
// Only override when the resolver is that bogus loopback default, so hosted
// environments keep their own DNS — important where the cluster sits behind a
// private endpoint that public resolvers cannot see. The callback and promises
// APIs keep separate resolvers and the driver resolves SRV through
// dns.promises, so both are set.
const DNS_FALLBACK = ['1.1.1.1', '8.8.8.8'];
const resolvers = dns.getServers();
if (resolvers.length === 0 || resolvers.every((s) => s === '127.0.0.1' || s === '::1')) {
  dns.setServers(DNS_FALLBACK);
  dns.promises.setServers(DNS_FALLBACK);
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

async function dbConnect() {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
