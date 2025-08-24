import mongoose from "mongoose";
import DB_NAME  from "../constants.js";  

const dbconnect = async () => {
      if (!process.env.MONGODB_URI) {
        throw new Error("Missing MONGODB_URI in environment variables");
    }
    try{
       const dbconnection= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`${dbconnection.connection.host} connected to database ${DB_NAME}`);

    }
    catch(err){
        console.error("Database connection failed:", err);
        throw err; // Re-throw the error for further handling if needed
    }
}

    export default dbconnect;