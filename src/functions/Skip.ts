import { type SkipParams } from './types'

export async function Skip({ vc, sendIfError, send, client, guild }: SkipParams): Promise<void> {
  if (vc == null) {
    await sendIfError('Join a voice channel bozo')
    return
  }

  if (guild == null) {
    await sendIfError('Guild not found')
    return
  }
  const player = client.music.players.get(guild.id)
  if (player?.channelId != null && player.channelId !== vc.id) {
    await sendIfError(`Join <#${player?.channelId ?? 'no channel found'}> bozo`)
    return
  }
  if (player == null) {
    await sendIfError("I'm not playing anything bozo")
    return
  }

  const current = player.queue.current
  if (current == null) {
    await sendIfError("I'm not playing anything bozo")
    return
  }

  await player.queue.skip()
  await player.queue.start()
  await send(`Skipped ${current.title}`)
}
