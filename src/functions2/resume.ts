import { millisecondsToString } from '@lib'
import { type CommonParams2Validated } from './types'

export async function Resume({ player, send, current }: CommonParams2Validated): Promise<void> {
  await player.pause(false)
  const positionHumanReadable = millisecondsToString(player.position ?? 0)
  await send(`Resumed ${current?.title} at ${positionHumanReadable}`)
}
