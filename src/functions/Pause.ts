import { millisecondsToString } from '@lib'
import { type PauseParams } from './types'

export async function Pause({ vc, sendIfError, send, client, guild }: PauseParams): Promise<void> {
  if (vc == null) {
    await sendIfError('Join a voice channel bozo')
    return
  }

  /* check if a player already exists, if so check if the invoker is in our vc. */
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
  await player.pause(true)
  const positionHumanReadable = millisecondsToString(player.position ?? 0)
  await send(`Paused ${current.title} at ${positionHumanReadable}`)
}
