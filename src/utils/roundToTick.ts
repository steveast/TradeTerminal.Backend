export function roundToTick(price: number, tickSize: number) {
  const precision = Math.round(-Math.log10(tickSize))
  return Number((Math.round(price / tickSize) * tickSize).toFixed(precision))
}
