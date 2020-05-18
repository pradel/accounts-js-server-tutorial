const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-toolkit/schema-merging");
const { AccountsModule } = require("@accounts/graphql-api");
const mongoose = require("mongoose");
const { Mongo } = require("@accounts/mongo");
const { AccountsServer } = require("@accounts/server");
const { AccountsPassword } = require("@accounts/password");

// We connect mongoose to our local mongodb database
mongoose.connect("mongodb://localhost:27017/accounts-js-server", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// We tell accounts-js to use the mongo connection
const accountsMongo = new Mongo(mongoose.connection);

const accountsPassword = new AccountsPassword({
  // You can customise the behavior of the password service by providing some options
});

const accountsServer = new AccountsServer(
  {
    // We link the mongo adapter to the server
    db: accountsMongo,
    // Replace this value with a strong random secret
    tokenSecret: "my-super-random-secret"
  },
  {
    // We pass a list of services to the server, in this example we just use the password service
    password: accountsPassword
  }
);

const typeDefs = gql`
  type Query {
    # This query will be protected so only authenticated users can access it
    sensitiveInformation: String @auth
  }
`;

const resolvers = {
  Query: {
    sensitiveInformation: () => "Sensitive info"
  }
};

// We generate the accounts-js GraphQL module
const accountsGraphQL = AccountsModule.forRoot({ accountsServer });

// A new schema is created combining our schema and the accounts-js schema
const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([typeDefs, accountsGraphQL.typeDefs]),
  resolvers: mergeResolvers([accountsGraphQL.resolvers, resolvers]),
  schemaDirectives: {
    ...accountsGraphQL.schemaDirectives
  }
});

const server = new ApolloServer({ schema, context: accountsGraphQL.context });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
