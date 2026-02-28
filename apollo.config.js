// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });

module.exports = {
  client: {
    service: {
      name: 'sci-graphql-app',
      url: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
      // TODO: Generate token for extension
      // headers: {
      //   authorization: process.env.NEXT_PUBLIC_PUBLIC_TOKEN,
      // },
    },
    "includes": ["./**/*.ts", "./**/*.tsx", "./**/*.graphql", "./**/*.js"],
    // array of glob patterns
    "excludes": ["**/node_modules/**/*", "./.*"]
  },
};
