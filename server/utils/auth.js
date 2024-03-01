const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: async function ({ req, connection }, next) {
    let token;

    // Check for token in HTTP headers (for HTTP requests)
    if (req) {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        token = authorizationHeader.split(' ').pop().trim();
      }
    }

    // Check for token in connection params (for WebSocket connections)
    if (connection) {
      token = connection.context.authorization;
    }

    if (!token) {
      throw new Error('You have no token!');
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      // Assuming you are using Express, you can set user data in the request context
      if (req) {
        req.user = data;
      }
      // For WebSocket connections, you may want to set data in the connection context
      if (connection) {
        connection.context.user = data;
      }
    } catch (error) {
      console.error('Invalid token', error);
      throw new Error('Invalid token!');
    }

    return next();
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};