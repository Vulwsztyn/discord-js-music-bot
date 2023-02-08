import { NightcoreParams } from './types'

export async function Nightcore({
  vc,
  sendIfError,
  send,
  client,
  guild,
  speed,
  pitch,
  rate,
}: NightcoreParams) {
  if (!vc) return sendIfError('Join a voice channel bozo')

  /* check if a player exists for this guild. */
  if (!guild) return sendIfError('Guild not found')
  const player = client.music.players.get(guild.id)
  if (!player?.connected) {
    return sendIfError("There's no active player for this guild.")
  }
  /* check if a player already exists, if so check if the invoker is in our vc. */
  if (player.channelId !== vc.id) {
    return sendIfError(`Join <#${player.channelId}> bozo`)
  }

  /* toggle the nightcore filter. */
  if (player.nightcore && !speed && !pitch && !rate) {
    player.nightcore = false
    player.filters.timescale = undefined
  } else {
    player.filters.timescale = {
      speed: speed || 1.125,
      pitch: pitch || 1.125,
      rate: rate || 1,
    }
  }

  await player.setFilters()
  return send(
    `${player.nightcore ? 'Enabled' : 'Disabled'} the **nightcore** filter!`
  )
}
