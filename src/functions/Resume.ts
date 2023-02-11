import { millisecondsToString } from '@lib'
import { type ResumeParams } from './types'

export async function Resume({ vc, sendIfError, send, client, guild }: ResumeParams): Promise<void> {
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

  await player.pause(false)
  const positionHumanReadable = millisecondsToString(player.position ?? 0)
  await send(`Resumed ${current.title} at ${positionHumanReadable}`)
}
