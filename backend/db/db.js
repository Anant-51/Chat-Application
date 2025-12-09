import mongoose from "mongoose";
import DB_NAME from "../constants.js";

const dbconnect = async () => {
  if (!process.env.MONGODB_URI)
    throw new Error("Missing MONGODB_URI in environment variables");

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      family: 4,
      retryWrites: true,
      w: "majority",
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    const dbconnection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      options
    );

    console.log(
      `✅ ${dbconnection.connection.host} connected to database ${DB_NAME}`
    );

    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB connection error:", err)
    );
    mongoose.connection.on("disconnected", () =>
      console.log("⚠️ MongoDB disconnected")
    );
    mongoose.connection.on("reconnected", () =>
      console.log("✅ MongoDB reconnected")
    );
    mongoose.connection.on("close", () =>
      console.log("⚠️ MongoDB connection closed")
    );

    return dbconnection;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
};

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) =>
  console.error("Unhandled Rejection:", err)
);
process.on("uncaughtException", (err) =>
  console.error("Uncaught Exception:", err)
);

export default dbconnect;
