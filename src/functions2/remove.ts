import { type RemoveParams } from './types'

export async function Remove({ player, sendIfError, send, index }: RemoveParams): Promise<void> {
  const removedTrack = player.queue.remove(index - 1)
  if (removedTrack == null) {
    await sendIfError('No tracks were removed.')
    return
  }

  await send(`The track [**${removedTrack.title}**](${removedTrack.uri}) was removed.`)
}
