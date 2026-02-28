# Project Name

## First time setup and deployment

These steps need to be performed only once after creating the repository from the template

### Secrets
1. Get the initial decryption keys from teammates
2. Run the script in `./scripts/refresh-keys.sh` to generate new `.production.key`, `.staging.key`, and `.development.key` encryption keys
3. Commit the changes and save all the `*.key` files in a secure location

### Amplify
1. Create an environment variable `ENV`. This can have only one of these value: `staging` or `prod`
2. Create an environment variable `DECRYPTION_KEY_PROD` with the same value as the prod decryption key
3. Create `DECRYPTION_KEY_STAGING` from the staging decryption key

### General
1. Update project name in `README.md`, `package.json`, and in `src/app/layout.tsx`
2. Update value of `STORAGE_PREFIX` in `src/common/constants/global.ts`
3. Add token in env file for usage in `apollo.config.js`
4. Update the headers in [customHttp.yml](customHttp.yml)
5. Update this Readme with information relevant to the project. [Example of a good readme](https://github.com/commutatus/awesome?tab=readme-ov-file#awesome)
6. Remove the `First time setup and deployment` section (including [Secrets](#secrets), [Amplify](#amplify), and [General](#general)) from the Readme

## Installing packages and Initial setup
1. Get access to the decryption key file from your team members. Paste these files in the root of the repository and then run these commands in order
2. `nvm install`
3. `npm i -g @commutatus/cm-env npmrc-replace-env --no-save`
4. `cm-env decrypt staging`
5. `npmrc-replace-env`
6. `npm install`

## Development
1. `nvm use` to set the correct node version
2. Use `npm run dev:staging` or `npm run dev:prod` to run local server
3. For notifications and any other feature that is shared between multiple pages, use [Globals Provider](src/common/context/globals/globals-provider.tsx)
4. Code should be mobile first. Use breakpoints to add responsiveness: Example: `p-[4px] lg:p-[8px]`
5. Don't use CSS for hiding/showing elements. Dynamically render those elements instead. Use [useResponsive hook](src/common/hooks/useResponsive.tsx) for components that hide/show based on screen width
6. [Use page router](https://ant.design/docs/react/v5-for-19)


## Encryption/Decryption flow
Example to update staging env:
1. Run `npm run decrypt-staging`
2. Edit `.env.local`
3. Run `npm run encrypt-staging`

## GraphQL types
- Use `npm run generate-types` to automatically generate types for queries and mutations used in project
- The generate types are located in `src/generated/graphql.ts`
