import { Utils } from '@lib'
import { ResumeParams } from './types'

export async function Resume({
  vc,
  sendIfError,
  send,
  client,
  guild,
}: ResumeParams) {
  if (!vc) return sendIfError('Join a voice channel bozo')

  if (!guild) return sendIfError('Guild not found')
  const player = client.music.players.get(guild.id)
  if (player && player.channelId && player.channelId !== vc.id) {
    return sendIfError(`Join <#${player.channelId}> bozo`)
  }
  if (!player) return sendIfError("I'm not playing anything bozo")

  const current = player.queue.current
  if (!current) return sendIfError("I'm not playing anything bozo")

  await player.pause(false)
  const positionHumanReadable = Utils.millisecondsToString(player.position || 0)
  await send(`Resumed ${current.title} at ${positionHumanReadable}`)
}
