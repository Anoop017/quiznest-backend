import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Connected to MongoDB"))
.catch(()=> console.error("MongoDB Connection Error:", err))


async function createTestUser(){
    try{
        const user = await User.create({
            username:"hashtest",
            email :"hashtest@email.com",
            password : "123456"
        });
        console.log("User Created", user);    
    }catch (err){
        console.error("Error creating user :", err);
        
    }finally {
        mongoose.connection.close();
    }
};


createTestUser();