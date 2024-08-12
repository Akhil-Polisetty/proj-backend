import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import cookieParser from "cookie-parser";
// import PayusersModel from "./model/PayusersModel.js";
import mongoose from "mongoose";
import crypto from "crypto";
// import base62 from "base62/lib/ascii.js";
import base64url from "base64url";
import Cookies from "js-cookie";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'



// import { createHash } from 'node:crypto';


// import { createHash } from "node:crypto";
// import { error } from "console";
import UserModel from "./models/UserModel.js";

let email_glob;

dotenv.config()

const app = express();
app.use(cors(
   { origin: 'http://localhost:3000', 
    credentials: true} 
));
app.use(express.json());
app.use(cookieParser());


const conn=process.env.MONGO

mongoose
  .connect(conn)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/register", async (req, res) => {
  try {
    console.log("entered registration")
    const { name, email, password } = req.body;
    console.log(name)
    console.log(email)
    console.log(password)
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = {
      uname: name,
      email: email,
      password: hashedpassword,
    };
    console.log("new user is ", newUser);
    await UserModel.create(newUser);
    console.log("after succesfully inserting");
    res.status(201).json({ message: "Registration Completed" });
  } catch (error) {
    console.log("Error Occurred at server 69: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("entered login route");
    const { email, password } = req.body;
    console.log("password is ", password);
    console.log("phone is ", email);
    if (!email || !password) {
      return res
        .status(201)
        .json({ message: "email and password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    console.log("the user is ", existingUser);
    if (!existingUser) {
      return res.status(201).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(201).json({ message: "Invalid Password" });
    }
    console.log("before the  cookie is stored ",email)
    const key=process.env.KEY
    const token = jwt.sign({ id: existingUser.uname }, key, { expiresIn: '1h' });
    console.log("the login is succesful");
    return res.status(200).json({ message: "Logged in Succesful",token,email });
  } catch (error) {
    console.log("Error Occurred at dummyserv 102: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get("/getUsering", (req, res) => {

    const email_cookie =req.cookies.uid;
    email_glob=email_cookie
    console.log("the stored cookie is ",email_cookie);
    UserModel.findOne({ email: email_glob })
      .then((user) => {
        if (user) {
            console.log("the data is ",user);
          res.status(200).json(user);
        } else {
          res.status(404).json("User not found");
        }
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  });
  

const verifyUser = async (req,res,next)=>
    {
      const key=process.env.KEY;
      console.log("the key is ",key)
      try
      {
        const token = req.cookies.acctoken;
        console.log("the token is for authenticating : ",token)
        if(!token)
        {
          return res.json({status:false,message:"no token"})
        }
        const decoded=jwt.verify(token,key);
        next();
      }
      catch(e)
      {
        return res.json(e);
      }
    }
    
    app.get('/auth/verify',verifyUser,(req,res)=>
    {
      return res.json({status:true,message:"authorized"});
    })
    
    app.get('/auth/logout',(req,res)=>
    {
      res.clearCookie('acctoken')
      res.clearCookie('uid')
      localStorage.clear('userinfo');
      localStorage.clear('uid');

      return res.json({status:true})
    })
  
  
  app.listen(5000, () => {
    console.log("the server is running fine");
  });
  
