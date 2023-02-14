import { millisecondsToString } from '@lib'
import { type CommonParams2Validated } from './types'

export async function Pause({ sendIfError, send, player }: CommonParams2Validated): Promise<void> {
  const current = player.queue.current
  if (current == null) {
    await sendIfError("I'm not playing anything bozo")
    return
  }
  await player.pause(true)
  const positionHumanReadable = millisecondsToString(player.position ?? 0)
  await send(`Paused ${current.title} at ${positionHumanReadable}`)
}
