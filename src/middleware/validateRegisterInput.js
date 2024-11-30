// Middleware for input validation
const validateRegisterInput = (req, res, next) => {
    const { username, email, password } = req.body;
    console.log(req.body)
  
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
  
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  
    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
  
    next();
  };

  module.exports = {
    validateRegisterInput
  }