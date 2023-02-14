import { type NightcoreParams } from './types'

export async function Nightcore({
  vc,
  sendIfError,
  send,
  client,
  guild,
  speed,
  pitch,
  rate
}: NightcoreParams): Promise<void> {
  if (vc == null) {
    await sendIfError('Join a voice channel bozo')
    return
  }

  /* check if a player exists for this guild. */
  if (guild == null) {
    await sendIfError('Guild not found')
    return
  }
  const player = client.music.players.get(guild.id)
  if (player?.connected !== true) {
    await sendIfError("There's no active player for this guild.")
    return
  }
  /* check if a player already exists, if so check if the invoker is in our vc. */
  if (player?.channelId != null && player.channelId !== vc.id) {
    await sendIfError(`Join <#${player?.channelId ?? 'no channel found'}> bozo`)
    return
  }

  /* toggle the nightcore filter. */
  if (player.nightcore && speed == null && pitch == null && rate == null) {
    player.nightcore = false
    player.filters.timescale = undefined
  } else {
    player.filters.timescale = {
      speed: speed ?? 1.125,
      pitch: pitch ?? 1.125,
      rate: rate ?? 1
    }
  }

  await player.setFilters()
  await send(`${player.nightcore ? 'Enabled' : 'Disabled'} the **nightcore** filter!`)
}
