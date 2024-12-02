// const express = require('express')
// const registerUser = require('../controllers/userController')
// const userRouter = express.Router()

// userRouter.post('/register', registerUser)

// module.exports = userRouter;

const express = require('express');
const {registerUserLogic, loginUser, logoutUser, getUser, getLogInStatus} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
  try {
    const result = await registerUserLogic(req.body); // Call the logic function
    if (result.success) {
      res.status(201).json(result); // Send success response
    } else {
      res.status(400).json(result); // Send error response
    }
  } catch (error) {
    console.error('Error in /register route:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

userRouter.post('/login', loginUser)
userRouter.get('/logout', logoutUser)
userRouter.get('/get-user', protect, getUser)
userRouter.get('/logged-in', getLogInStatus)

module.exports = userRouter;
