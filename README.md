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

## Performance & Pricing Model (Stakeholder Summary)

This app calculates each quarter’s portfolio performance using two components per stock: a base historical return and an event-driven overlay. These are applied once when you submit a quarter’s rebalance.

- **Base historical return (R_base)**
  - Deterministic, sector-level return for the quarter.
  - Small mean-zero range (e.g., ±2–3.5% depending on sector).
  - Purpose: represent market’s ordinary drift without specific news.

- **Event-driven overlay (Abnormal return, A)**
  - Built from the quarter’s events (earnings, macro, policy, commodity, geopolitical, sentiment) that target the stock or its sector.
  - Each event contributes: direction × impact × sensitivity × confidence × shape × decay.
    - direction: +1 or -1
    - impact: impactScore/100 (e.g., 25% becomes 0.25)
    - sensitivity: 1.0 if the stock is directly targeted; 0.4 if only sector-level
    - confidence: high 1.0, medium 0.75, low 0.5
    - shape (shockProfile): impulse 0.6, ramp 0.8, step 1.0 (quarter-average weight)
    - decay (decayHalfLife): quarter-average factor from half-life, 0.25–1.0
  - Overlay is capped each quarter to ±6% to provide guardrails.

- **Per-stock quarter return and price**
  - totalReturn_i = R_base(sector_i, q) + clamp_±6%(Σ event terms for i)
  - newPrice_i = oldPrice_i × (1 + totalReturn_i)

- **Portfolio value and returns**
  - For each stock: new value = quantity × newPrice.
  - Portfolio capital = sum of all stock values + cash.
  - Quarter return (%) = (capital_this_q − capital_prev_q) ÷ capital_prev_q × 100.
  - Total return (%) = (capital_this_q − startingCapital) ÷ startingCapital × 100.

- **Determinism & fairness**
  - The same quarter and portfolio produce the same events and base returns (seeded), enabling consistent learning and comparison.
  - Guardrails (±6% overlay cap) prevent extreme quarter swings from events alone.

- **Notes**
  - Base returns are small and unbiased; events provide the primary differentiation.
  - Shock profiles and decay govern how much of an event’s nominal impact shows up within a single quarter.
  - These effects are applied once per quarter at the time of rebalance submission.
