const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

module.exports.login = (req, res) => {
  const token = jwt.sign({
    id: req.user.id,
    username: req.user.username,
  }, 'React-Ion-Secret', { expiresIn: 7200 });
  res.json({ data: {
    id: req.user.id,
    username: req.user.username,
    token,
  } });
};

module.exports.signup = (req, res) => {
  const username = req.body.username;
  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.status(400).json({
        errorCode: 400,
        errorMessage: 'Unable to retrieve user',
      });
    }
    if (user) {
      return res.status(400).json({
        errorCode: 400,
        errorMessage: 'Username taken',
      });
    }
    return User.create(req.body, (err2, newUser) => {
      if (err2) {
        return res.status(400).json({
          errorCode: 400,
          errorMessage: 'Unable to create user',
        });
      }
      const token = jwt.sign({
        id: newUser.id,
        username: newUser.username,
      }, 'React-Ion-Secret', { expiresIn: 7200 });
      return res.json({ data: {
        id: newUser.id,
        username: newUser.username,
        token,
      } });
    });
  });
};

// module.exports.logout = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({
//         errorCode: 500,
//         errorMessage: 'Failed to destroy session',
//       });
//     }
//     return res.status(200).json({ data: 'Logout Successful' });
//   });
// };

module.exports.authenticate = (req, res) => {
  if (req.user) {
    return res.status(200).json({ data: 'Authorized' });
  }
  return res.status(401).json({
    errorCode: 401,
    errorMessage: 'Unauthorized',
  });
};
