import { type CommonParams2Validated } from './types'

export async function Skip({ player, send, current }: CommonParams2Validated): Promise<void> {
  await player.queue.skip()
  await player.queue.start()
  await send(`Skipped ${current?.title}`)
}
