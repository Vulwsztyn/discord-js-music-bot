import { Utils } from '@lib'

import { type SeekParams } from './types'

export async function Seek({ vc, sendIfError, send, client, guild, position, add }: SeekParams): Promise<void> {
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
    await sendIfError("I'm not playing anything bozo (no player)")
    return
  }

  const current = player.queue.current
  if (current == null) {
    await sendIfError("I'm not playing anything bozo (no current song)")
    return
  }

  const positionNumerised = (add ? player.position ?? 0 : 0) + Utils.stringToMilliseconds(position)
  if (isNaN(positionNumerised)) {
    await sendIfError('Position must be a number')
    return
  }
  await player.seek(positionNumerised)

  const positionHumanReadable = Utils.millisecondsToString(positionNumerised)

  await send(`Sought ${current.title} to ${positionHumanReadable}`)
}
