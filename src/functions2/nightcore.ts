import { CommonParams2Validated, type NightcoreParams } from './types'

export async function Nightcore({
  send,
  speed: speedParam,
  pitch: pitchParam,
  rate: rateParam,
  player
}: NightcoreParams): Promise<void> {
  const shouldEnable = !player.nightcore || speedParam != null || pitchParam != null || rateParam != null
  if (!shouldEnable) {
    await send("Nightcoren't")
    player.nightcore = false
    player.filters.timescale = undefined
  } else {
    player.nightcore = true
    const speed = speedParam ?? 1.125
    const pitch = pitchParam ?? 1.125
    const rate = rateParam ?? 1
    await send(`Nightcore enabled with speed ${speed}, pitch ${pitch}, and rate ${rate}`)
    player.filters.timescale = { speed, pitch, rate }
  }

  await player.setFilters()
}
