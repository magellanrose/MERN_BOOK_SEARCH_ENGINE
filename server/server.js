const express = require('express');
const { ApolloServer } = require('@apollo/server');
const path = require('path');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Create an Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    // For HTTP requests
    if (req) {
      return { req, user: req.user }; // Assuming you set req.user in authMiddleware
    }
    // For WebSocket connections
    if (connection) {
      return { connection, user: connection.context.user };
    }
  },
});

// Apply Apollo Server middleware to Express
server.applyMiddleware({ app });

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});