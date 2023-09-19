const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require("bcrypt"); 
const path = require("path")
mongoose.connect(
    "your_mongodb_connection",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  

  const app = express();
  app.use(bodyParser.json());
  app.use("/", express.static(path.join(__dirname, "indexes")));
  app.post("/register", async (req, res) => {
    const {email, password: plainTextPassword } = req.body;
  
    if (plainTextPassword.length < 8) {
      return res.json({
        status: "error",
        error: "Password too small. Should be atleast 8 characters",
      });
    }
  
    const password = await bcrypt.hash(plainTextPassword, 10);
  
    try {
      const response = await User.create({
        email,
        password,
      });
      console.log("User created successfully: ", response);
    } catch (error) {
      if (error.code === 11000) {
        // duplicate key
        return res.json({ status: "error", error: "email already in use" });
      }
      throw error;
    }
  
    res.json({ status: "ok" });
  });
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
  
    if (!user) {
      return res.json({ status: "error", error: "Invalid email/password" });
    }
  
    if (await bcrypt.compare(password, user.password)) {
  
      return res.json({ status: "ok" });
    }
  
    res.json({ status: "error", error: "Invalid email/password" });
  });
  
  app.listen(3000, () => {
    console.log("server up at 3000");
  });