const { ServiceBroker } = require('moleculer');
const { createGraphqlMixin } = require('../../../lib/createGraphqlMixin');
const { books } = require('../helpers/data');
const transporter = require('../helpers/transport')();

const broker = new ServiceBroker({
  nodeID: `Book`,
  // logger: console,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});


const schema = `
  type Book {
    id: Int,
    title: String,
    authorId: Int,
    year: Int,
  }

  type Query {
    book(id: Int!): Book,
    books: [Book],
    booksByAuthor(authorId: Int!): [Book],
  }
`;

const relationships = `
  extend type Book {
    author: Author,
    chapters: [Chapter],
  }
`;

const relationDefinitions = {
  chapters: {
    type: 'query',
    operationName: 'chaptersInBook',
    args: {
      bookId: 'parent.id',
    },
  },
  author: {
    type: 'query',
    operationName: 'author',
    args: {
      id: 'parent.authorId',
    },
  },
};

const queries = {
  books: () => books,
  book: (_, { id }) => books.find(book => book.id === id),
  booksByAuthor: (_, { authorId }) => books.filter(book => book.authorId === authorId),
};

const resolvers = {
  Query: queries,
};

const bookGraphQL = createGraphqlMixin({
  typeName: 'Book',
  schema,
  resolvers,
  relationships,
  relationDefinitions,
});

const service = {
  name: 'Book',
  mixins: [bookGraphQL],
};

broker.createService(service);

broker.start();

module.exports = service;