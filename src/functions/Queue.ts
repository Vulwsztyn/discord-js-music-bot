import { type QueueParams } from './types'

const formatIndex = (index: number, size: number): string =>
  (index + 1).toString().padStart(size.toString().length, '0')

export async function Queue({ sendIfError, send, client, guild }: QueueParams): Promise<void> {
  /* check if a player exists for this guild. */
  if (guild == null) {
    await sendIfError('Guild not found')
    return
  }
  const player = client.music.players.get(guild.id)
  if (player?.connected !== true) {
    await sendIfError("I couldn't find a player for this guild.")
    return
  }

  /* check if the queue is empty. */
  if (player.queue.tracks.length === 0) {
    await sendIfError('There are no tracks in the queue.')
    return
  }

  /* respond with an embed of the queue. */
  const size = player.queue.tracks.length
  const str = player.queue.tracks
    .map(
      (t, idx) =>
        `\`#${formatIndex(idx, size)}\` [**${t.title}**](${t.uri}) ${
          t.requester !== undefined ? `<@${t.requester}>` : ''
        }`
    )
    .join('\n')

  await send(`Queue for **${guild.name}**`, str)
}
