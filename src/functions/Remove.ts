import { RemoveParams } from './types'

export async function Remove({
  vc,
  sendIfError,
  send,
  client,
  guild,
  index,
}: RemoveParams) {
  if (isNaN(index)) return sendIfError('index must be a number')

  if (!guild) return sendIfError('Guild not found')
  const player = client.music.players.get(guild.id)
  if (!player?.connected)
    return sendIfError("I couldn't find a player for this guild.")

  /* check if the user is in the player's voice channel. */
  if (!vc || player.channelId !== vc.id)
    return sendIfError("You're not in my voice channel, bozo.")

  /* remove the track from the queue. */
  const removedTrack = player.queue.remove(index - 1)
  if (!removedTrack) return sendIfError('No tracks were removed.')

  return send(
    `The track [**${removedTrack.title}**](${removedTrack.uri}) was removed.`
  )
}
