import dotenv from 'dotenv';
dotenv.config();

console.log('🔄 Environment variables loaded');

import express from 'express';

import app from './app/app.js';

import dbconnect from './db/db.js';
const PORT = process.env.PORT || 3000;
console.log('🔌 Attempting to connect to DB...');
dbconnect().then(()=>{
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        
        console.log(`Server is running on port ${PORT}`)})
    
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process if database connection fails
});
// Serve static files from the public directory
