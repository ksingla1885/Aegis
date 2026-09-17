import { MongoClient } from 'mongodb';

let clientPromise = null;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined in environment variables.');
  }

  if (clientPromise) return clientPromise;

  const options = {};

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default function getClient() {
  return getClientPromise();
}

/**
 * Helper to get the database instance directly
 */
export async function getDatabase(dbName = 'mindora_aegis') {
  const promise = getClientPromise();
  const connectedClient = await promise;
  return connectedClient.db(dbName);
}
