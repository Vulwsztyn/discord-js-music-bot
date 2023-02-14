import { type RemoveParams } from './types'

export async function Remove({ vc, sendIfError, send, client, guild, index }: RemoveParams): Promise<void> {
  if (isNaN(index)) {
    await sendIfError('index must be a number')
    return
  }

  if (guild == null) {
    await sendIfError('Guild not found')
    return
  }
  const player = client.music.players.get(guild.id)
  if (player?.connected !== true) {
    await sendIfError("I couldn't find a player for this guild.")
    return
  }

  /* check if the user is in the player's voice channel. */
  if (vc == null || player.channelId !== vc.id) {
    await sendIfError("You're not in my voice channel, bozo.")
    return
  }

  /* remove the track from the queue. */
  const removedTrack = player.queue.remove(index - 1)
  if (removedTrack == null) {
    await sendIfError('No tracks were removed.')
    return
  }

  await send(`The track [**${removedTrack.title}**](${removedTrack.uri}) was removed.`)
}
