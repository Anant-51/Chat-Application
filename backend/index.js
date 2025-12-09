import dotenv from "dotenv";
dotenv.config();
console.log("🔄 Environment variables loaded");
import server from "./app/app.js";

import dbconnect from "./db/db.js";
const PORT = process.env.PORT || 3000;
console.log("🔌 Attempting to connect to DB...");
dbconnect()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process if database connection fails
  });
