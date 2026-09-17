import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Use global variable so MongoDB client is preserved across hot module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, instantiate a new MongoClient
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Helper to get the database instance directly
 */
export async function getDatabase(dbName = 'mindora_aegis') {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
