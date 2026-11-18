[![make.fun · btc-race-24h-20261118-1444](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/jinglue25/btc-race-24h-20261118-1444/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/jinglue25/btc-race-24h-20261118-1444/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)

Washout Bounce trades cbBTC with $1,000 of paper capital through the kit's newline-delimited bars protocol. It buys after a 60-bar decline of at least 0.40%, provided the last three bars recover at least 0.20% and the latest close exceeds the previous close.

The bot spends 100% of available equity, bounded by cash and the hello weight cap, and respects hello's minimum notional. It sells the whole position at a marked value 1% above cost, 1% below cost, or after 360 batches from the confirmed buy fill. Confirmed exits start a 10-batch cooldown. Orders allow 100 bps slippage from the decision close, including execution impact. Rejected exits are retried. Returns, prices, and amounts use BigInt; decisions use only received bars and account state. No network, clock, randomness, or runtime file access is used.

Run with Node 22 supporting native TypeScript stripping:

```sh
node main.ts < protocol.ndjson > replies.ndjson
```

For a normal local environment, grade with the kit's process driver (the CLI requires the bot directory):

```sh
node "$KIT/cli/makefun.mjs" grade-local --kit "$KIT" --bot "$PWD" --driver process --worktree
```

The final local strategy evaluation returned +11.559938 USDC net PnL, 4 filled orders (two completed round trips), 1.4963562% maximum drawdown, and +9.945834 USDC at doubled fees. This passes the profitability dev gate. One last-bar entry was rejected after_end. Two executions produced identical orders; L1 regrading reproduced byte for byte. Dev performance does not establish future race performance.

Local environment limitations: the unmodified CLI was blocked while creating its temporary Git snapshot, and Node-spawned child pipes did not carry protocol input correctly. Four completed strategy evaluations used a temporary CLI copy with direct directory snapshots and a Python stdio bridge to the same Node process driver. The fill model, scorer, and determinism checks were unchanged; the kit was not edited. The local Node runtime was v24.22.1, while the kit reported server harness v26.13.1, so result hashes are not server-equivalent. No transcripts were supplied to local grading, so its transcript/authorship prize checks remain unevaluated for submission. Nothing was submitted.

Entry files: `main.ts`, `vendor/makefun-bars.ts` (byte-identical kit SDK), `README.md`, `LICENSE`, `.makefun/owner.json`.
