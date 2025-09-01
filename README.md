This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Environment: MongoDB and Learn data

- Create a `.env.local` file in the project root and set your Mongo connection string:

```bash
# .env.local
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

- Ensure the database has collections per our DB→UI contract in `docs/db_to_ui_contract.md`:
  - `lessons`
  - `content_blocks`
  - `anchors`

- The lessons page endpoints expect the following linking flexibility:
  - `lessons.slug` is used to fetch a lesson.
  - `content_blocks.lesson_id` can be either the lesson `_id` or the lesson `slug`.
  - `content_blocks.payload.items[*].anchor_ids` and `content_blocks.anchor_ids` link to `anchors._id`.

- Dev commands:
  - Install deps: `npm install`
  - Run: `npm run dev`

Tip: If you see no lessons/blocks, verify the linkage above and that `MONGODB_URI` is correctly set. External links open in a new tab with `rel="noreferrer"`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
