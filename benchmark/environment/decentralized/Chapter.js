const { ServiceBroker } = require('moleculer');
const { createGraphqlMixin } = require('../../../lib/createGraphqlMixin');
const { chapters } = require('../helpers/data');
const transporter = require('../helpers/transport')();

const broker = new ServiceBroker({
  nodeID: `Chapter`,
  // logger: console,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});

const schema = `
  type Chapter {
    id: Int,
    title: String,
    bookId: Int,
  }

  type Query {
    chapter(id: Int!): Chapter,
    chapters: [Chapter],
    chaptersInBook(bookId: Int!): [Chapter],
  }
`;

const relationships = `
  extend type Chapter {
    book: Book,
  }
`;

const relationDefinitions = {
  book: {
    type: 'query',
    operationName: 'book',
    args: {
      id: 'parent.bookId',
    },
  },
};

const queries = {
  chapters: () => chapters,
  chapter: (_, { id }) => chapters.find(chapter => chapter.id === id),
  chaptersInBook: (_, { bookId }) => chapters.filter(chapter => chapter.bookId === bookId),
};

const resolvers = {
  Query: queries,
};

const chapterGraphQL = createGraphqlMixin({
  typeName: 'Chapter',
  schema,
  resolvers,
  relationships,
  relationDefinitions,
});

const service = {
  name: 'Chapter',
  mixins: [chapterGraphQL],
};

broker.createService(service);

broker.start();

module.exports = service;
