import { type CommonParams2Validated } from './types'

const formatIndex = (index: number, size: number): string =>
  (index + 1).toString().padStart(size.toString().length, '0')

export async function Queue({ player, send, guild }: CommonParams2Validated): Promise<void> {
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
