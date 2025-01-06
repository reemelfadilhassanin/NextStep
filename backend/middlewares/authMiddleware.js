import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Get the token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Decode the token and attach the user to the request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);  // Log decoded token for debugging

    req.user = decoded.user;  // Attach user info to the request object

    // Log authenticated user for debugging
    console.log('Authenticated user:', req.user);

    next();  // Proceed to the next middleware or controller
  } catch (error) {
    console.error('Token verification failed:', error); // Log any verification errors
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
