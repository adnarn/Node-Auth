const argon2 = require("argon2");
const mongoose = require("mongoose");
const validator = require("validator"); // For email validation
const User = require("../models/user"); // Adjust this path based on your folder structure
const jwt = require("jsonwebtoken")


const generateToken = (id) => {
  return jwt.sign({id}, process.env.SECRET_KEY, {expiresIn: '1d'})
}

const registerUser = async (userData) => {
  try {
    // Destructure user data
    const { name, email, password } = userData;

    // Validate input
    if (!name || !email || !password) {
      return { success: false, message: "All fields are required" };
    }

    if (!validator.isEmail(email)) {
      return { success: false, message: "Invalid email format" };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least six characters",
      };
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "Email already exists" };
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        photo: newUser.photo,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "An error occurred during registration" };
  }
};


// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please input email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify the password
    const passwordIsCorrect = await argon2.verify(user.password, password);
    if (!passwordIsCorrect) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    //token
     const token = generateToken(user._id)

     //send token
     res.cookie("token", token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true
     })

    // Send a success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        token
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const logoutUser = async (req, res) => {
  try {
     res.cookie("token", "", {
      path: '/',
      httpOnly: true,
      expires: new Date(0),
      sameSite: "none",
      secure: true
     })
     return res.status(200).json({success: true, message: "User logout successfully"});
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

const getUser = async (req, res) => {
  try {
    // Fetch the user by ID from the request object (populated by middleware)
    const user = await User.findById(req.user._id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photo: user.photo,
        },
      });
    } else {
      console.error("User not found during fetching info.");
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error during fetching user info:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
const getLogInStatus = async (req, res) => {
  try {
        const token = req.cookies.token;
        
      if (!token) {
        return res.status(401).json(false)
      }

    const verified = jwt.verify(token, process.env.SECRET_KEY);
    if (verified){
      return res.json(true)
    }
      return res.status(401).json(false)
    
    }
   catch (error) {
    console.error("Error during fetching user info:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



module.exports = {registerUser, loginUser, logoutUser, getUser, getLogInStatus };
