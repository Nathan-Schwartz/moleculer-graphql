const { ServiceBroker } = require('moleculer');
const { graphql } = require('graphql');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { authors, books, chapters } = require('../helpers/data');
const { buildRelationalResolvers } = require('../../../lib/Gateway/buildRelationalResolvers');
const transporter = require('../helpers/transport')();

const broker = new ServiceBroker({
  nodeID: `Gateway`,
  // logger: console,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});

const typeDefs = `
type Chapter {
  id: Int,
  title: String,
  bookId: Int,
  book: Book,
}

type Query {
  chapter(id: Int!): Chapter,
  chapters: [Chapter],
  chaptersInBook(bookId: Int!): [Chapter],
  author(id: Int!): Author,
  authors: [Author],
  authorOf(bookId: Int!): Author,
  book(id: Int!): Book,
  books: [Book],
  booksByAuthor(authorId: Int!): [Book],
}

type Book {
  id: Int,
  title: String,
  authorId: Int,
  year: Int,
  author: Author,
  chapters: [Chapter],
}

type Author {
  id: Int,
  books: [Book],
  name: String,
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

const relationDefinitions = {
  Chapter: {
    book: {
      type: 'query',
      operationName: 'book',
      args: {
        id: 'parent.bookId',
      },
    }
  },
  Book: {
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
    }
  },
  Author: {
    books: {
      type: 'query',
      operationName: 'booksByAuthor',
      args: {
        authorId: 'parent.id',
      },
    },
  }
};

// console.log()

const Query = {
  chapters: () => chapters,
  chapter: (_, { id }) => chapters.find(chapter => chapter.id === id),
  chaptersInBook: (_, { bookId }) => chapters.filter(chapter => chapter.bookId === bookId),
  books: () => books,
  book: (_, { id }) => books.find(book => book.id === id),
  booksByAuthor: (_, { authorId }) => books.filter(book => book.authorId === authorId),
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

const partialSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const schema = mergeSchemas({
  schemas: [partialSchema],
  resolvers: buildRelationalResolvers(relationDefinitions)
})

broker.createService({
  name: 'gateway',
  actions: {
    graphql: {
      params: {
        query: { type: 'string' },
        variables: { type: 'object', optional: true }
      },
      handler: ctx => graphql(schema, ctx.params.query, null, null, ctx.params.variables),
    },
  },
});

broker.start();
