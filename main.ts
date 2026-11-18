import { BPS, runBars } from './vendor/makefun-bars.ts';

// Washout Bounce: react only to observed closes; execution belongs to the replay.
const LOOKBACK = 60;
const WASHOUT_BPS = 40n;
const TURN_BARS = 3;
const TURN_BPS = 20n;
const TAKE_PROFIT_BPS = 100n;
const STOP_LOSS_BPS = 100n;
const MAX_HOLD = 360;
const COOLDOWN = 10;
const SIZE_BPS = 10_000n;
const MAX_SLIPPAGE_BPS = 100;

const closes: bigint[] = [];
let enteredAt: number | null = null;
let cooldownUntil = -1;
let exiting = false;

await runBars({
  onBatch(state, batch) {
    const symbol = 'CBBTC';
    // State follows confirmed fills, so rejected entries never start a hold timer
    // and rejected exits remain pending until they can be filled.
    for (const fill of batch.fills) {
      if (fill.symbol !== symbol || fill.status !== 'filled') continue;
      if (fill.side === 'buy') enteredAt = batch.seq;
      else {
        enteredAt = null;
        exiting = false;
        cooldownUntil = batch.seq + COOLDOWN;
      }
    }
    const bar = batch.bars.find((b) => b.symbol === symbol);
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    closes.push(close);
    if (closes.length > LOOKBACK + 1) closes.shift();
    if (state.warmingUp) return [];

    const held = state.positions.get(symbol);
    if (held !== undefined) {
      const value = state.value(symbol, held.qty);
      const profit = value * BPS >= held.cost * (BPS + TAKE_PROFIT_BPS);
      const loss = value * BPS <= held.cost * (BPS - STOP_LOSS_BPS);
      const expired = enteredAt !== null && batch.seq - enteredAt >= MAX_HOLD;
      exiting ||= profit || loss || expired;
      return exiting
        ? [{ side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }]
        : [];
    }
    if (batch.seq < cooldownUntil || closes.length <= LOOKBACK) return [];
    const washedOut = close * BPS <= closes[0]! * (BPS - WASHOUT_BPS);
    const turningUp = close * BPS >= closes[closes.length - 1 - TURN_BARS]! * (BPS + TURN_BPS)
      && close > closes[closes.length - 2]!;
    if (!washedOut || !turningUp) return [];

    let spend = state.equity * SIZE_BPS / BPS;
    if (spend > state.cash) spend = state.cash;
    const room = state.weightRoom(symbol);
    if (spend > room) spend = room;
    if (state.positions.size >= state.hello.caps.max_open_positions
      || spend < BigInt(state.hello.fees.min_notional_quote_units) || spend === 0n) return [];
    return [{ side: 'buy', symbol, notional_quote_units: spend, max_slippage_bps: MAX_SLIPPAGE_BPS }];
  },
});
