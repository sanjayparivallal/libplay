import { MongoClient, Db, ObjectId } from "mongodb";

// Re-export ObjectId so routes only need to import from here
export { ObjectId };

function buildMongoUri(): string {
  const rawUri = process.env.DATABASE_URL;
  const rawPassword = process.env.DATABASE_PASSWORD;

  if (!rawUri) {
    return "mongodb://localhost:27017/libplay";
  }

  if (rawUri.includes("<db_password>")) {
    if (!rawPassword) {
      throw new Error(
        "DATABASE_PASSWORD is required when DATABASE_URL contains <db_password>."
      );
    }
    return rawUri.replace("<db_password>", encodeURIComponent(rawPassword));
  }

  return rawUri;
}

const uri = buildMongoUri();

const DB_NAME = process.env.DATABASE_NAME || "libplay";

// In development, use a module-level cache to survive hot-reloads
// In production, use a module-level singleton
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
    });
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    maxPoolSize: 10,
  });
}

export async function getDb(): Promise<Db> {
  if (!client.connect) {
    throw new Error("MongoClient is not initialized");
  }
  try {
    // connect() is idempotent and safe to call multiple times
    await client.connect();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to connect to MongoDB. ${message}. Verify DATABASE_URL, Atlas network access, and outbound TCP access to port 27017.`
    );
  }
  return client.db(DB_NAME);
}
