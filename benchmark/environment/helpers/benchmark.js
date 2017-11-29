const { promisify } = require('util');
let Benchmarkify = require("benchmarkify");

const waitFor = promisify(setTimeout);

module.exports = async(broker) => {
  const title = `${process.env.TRANSPORT} ${process.env.STRATEGY}`
  let benchmark = new Benchmarkify(title).printHeader();

  // Create a test suite
  let bench = benchmark.createSuite(title);

  // Add first func
  bench.add("Make 1 complex request", (done) => {
    broker.call('gateway.graphql', {
      query: `{
        chapters {
          title,
          id,
          bookId,
        }
        books {
          title,
          year,
          id,
          authorId
          chapters {
            bookId
            title
            id
          }
        }
        authors {
          name,
          id,
          books {
            title,
            year,
            authorId,
            id
            chapters {
              title,
              id,
              bookId,
            }
          }
        }
      }`,
    }).then(done);
  });

  bench.add("Make 1 simple request", (done) => {
    broker.call('gateway.graphql', {
      query: `{
        chapters {
          title,
          id,
          bookId,
        }
      }`,
    }).then(done);
  });

  bench.add("Make 10 requests", (done) => {
    Promise.all(Array(10).fill().map(() =>
      broker.call('gateway.graphql', {
        query: `{
          authors {
            name,
            id,
            books {
              title,
              year,
              authorId,
              id
              chapters {
                title,
                id,
                book{
                  title,
                  year,
                  id,
                },
              }
            }
          }
        }`,
      })
    )).then(done);
  });

  return bench.run();
};
