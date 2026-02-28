// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });

module.exports = {
  overwrite: true,
  schema: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  documents: ["./**/*.tsx", "./**/*.ts", "./**/*.graphql", "!**/node_modules/**"], // Path to your GraphQL queries
  generates: {
    "src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
};
