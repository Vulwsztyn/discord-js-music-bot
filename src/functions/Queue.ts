import { QueueParams } from './types'

const formatIndex = (index: number, size: number) =>
  (index + 1).toString().padStart(size.toString().length, '0')

export async function Queue({ sendIfError, send, client, guild }: QueueParams) {
  /* check if a player exists for this guild. */
  if (!guild) return sendIfError('Guild not found')
  const player = client.music.players.get(guild.id)
  if (!player?.connected) {
    return sendIfError("I couldn't find a player for this guild.")
  }

  /* check if the queue is empty. */
  if (!player.queue.tracks.length) {
    return sendIfError('There are no tracks in the queue.')
  }

  /* respond with an embed of the queue. */
  const size = player.queue.tracks.length
  const str = player.queue.tracks
    .map(
      (t, idx) =>
        `\`#${formatIndex(idx, size)}\` [**${t.title}**](${t.uri}) ${
          t.requester ? `<@${t.requester}>` : ''
        }`
    )
    .join('\n')

  return send(`Queue for **${guild.name}**`, str)
}
