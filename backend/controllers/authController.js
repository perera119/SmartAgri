const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'User',
    });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    }
  } catch (error) {
    // If DB is offline, we'd normally get an error here. 
    // In our hybrid mode, we can return success if we want to mock it,
    // but better to handle it properly.
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        message: 'Login successful',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    // Mock login if DB is offline and credentials match the default
    if (email === 'sanjula@agriwatch.com' && password === 'password123') {
      return res.json({
        message: 'Login successful (Mock Mode)',
        user: {
          email: email,
          firstName: 'Sanjula',
          lastName: 'Perera',
          role: 'Admin'
        }
      });
    }
    res.status(500).json({ error: 'Server error or Database offline' });
  }
};

module.exports = { registerUser, loginUser };
