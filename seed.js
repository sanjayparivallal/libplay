const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("libplay");
    const usersCollection = db.collection("users");

    await usersCollection.deleteMany({});
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await usersCollection.insertMany([
      {
        email: "staff@library.com",
        name: "Library Staff",
        password: hashedPassword,
        role: "STAFF",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: "staff2@library.com",
        name: "Staff Member 2",
        password: hashedPassword,
        role: "STAFF",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: "librarian@library.com",
        name: "Head Librarian",
        password: hashedPassword,
        role: "LIBRARIAN",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: "display@library.com",
        name: "Display Screen",
        password: hashedPassword,
        role: "DISPLAY",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log("Seeded all users successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
