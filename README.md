This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## How to make this template

1. create next js application by cli  
https://nextjs.org/docs/app/getting-started/installation#create-with-the-cli
```
% npx create-next-app@latest
✔ Would you like to use the recommended Next.js defaults? › No, customize settings
✔ Would you like to use TypeScript? … No / Yes => Yes
✔ Which linter would you like to use? › ESLint
✔ Would you like to use React Compiler? … No / Yes => Yes
✔ Would you like to use Tailwind CSS? … No / Yes => No
✔ Would you like your code inside a `src/` directory? … No / Yes => Yes
✔ Would you like to use App Router? (recommended) … No / Yes => Yes
✔ Would you like to customize the import alias (`@/*` by default)? … No / Yes => Yes
✔ What import alias would you like configured? … @/*
✔ Would you like to include AGENTS.md to guide coding agents to write up-to-date Next.js code? … No / Yes
```

2. setup Prettier for nextjs  
https://nextjs.org/docs/app/api-reference/config/eslint#with-prettier
```
npm i -D eslint-config-prettier
```
Then, add prettier to your existing ESLint config.

3. install prettier  
https://prettier.io/docs/install
```
npm install --save-dev --save-exact prettier@3.9.9
node --eval "fs.writeFileSync('.prettierrc','{}\n')"
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
