const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");
const { Mongo } = require("@accounts/mongo");

// We connect mongoose to our local mongodb database
mongoose.connect("mongodb://localhost:27017/accounts-js-server", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// We tell accounts-js to use the mongo connection
const accountsMongo = new Mongo(mongoose.connection);

const typeDefs = gql`
  type Query {
    # This query will be protected so only authenticated users can access it
    sensitiveInformation: String
  }
`;

const resolvers = {
  Query: {
    sensitiveInformation: () => "Sensitive info"
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
