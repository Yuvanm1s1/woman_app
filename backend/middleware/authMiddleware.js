// const jwt = require('jsonwebtoken');

// module.exports = function (req, res, next) {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Adds the userId to the request object
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the full string from the header
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // 2. THIS IS THE KEY: Split "Bearer [token]" and take index [1]
    // If the header is just the token, it will still work if you handle it correctly
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    // 3. Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verify Error:", err.message); // This helps you debug in the console
    res.status(401).json({ msg: "Token is not valid" });
  }
};