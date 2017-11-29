const { ServiceBroker } = require('moleculer');
const { createGraphqlMixin } = require('../../../lib/createGraphqlMixin');
const { authors } = require('../helpers/data');
const transporter = require('../helpers/transport')();

const broker = new ServiceBroker({
  nodeID: `Author`,
  // logger: console,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});


const schema = `
  type Author {
    id: Int,
    name: String,
  }

  type Query {
    author(id: Int!): Author,
    authors: [Author],
    authorOf(bookId: Int!): Author,
  }

  input UpdateAuthorInput {
    id: Int!
    clientMutationId: Int!
    name: String
  }

  type UpdateAuthorPayload {
    author: Author
    clientMutationId: Int
  }

  type Mutation {
    updateAuthor(input: UpdateAuthorInput!): UpdateAuthorPayload,
  }
`;

const relationships = `
  extend type Author {
    books: [Book],
  }
`;

const relationDefinitions = {
  books: {
    type: 'query',
    operationName: 'booksByAuthor',
    args: {
      authorId: 'parent.id',
    },
  },
};

const Query = {
  authors: () => authors,
  author: (_, { id }) => authors.find(author => author.id === id),
};

const Mutation = {
  updateAuthor(_, { id, name, clientMutationId }) {
    const authorIdx = authors.findIndex(author => author.id === id);
    const author = authors[authorIdx];
    if (!name) return author;
    author.name = name;
    authors[authorIdx] = author;
    return { author, clientMutationId };
  }
}

const resolvers = {
  Query,
  Mutation
};

const authorGraphQL = createGraphqlMixin({
  typeName: 'Author',
  schema,
  resolvers,
  relationships,
  relationDefinitions,
});

const service = {
  name: 'Author',
  mixins: [authorGraphQL],
};

broker.createService(service);

broker.start();

module.exports = service;