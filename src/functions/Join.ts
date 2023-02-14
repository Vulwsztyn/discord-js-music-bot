import { type JoinParams } from './types'

export async function Join({ vc, client, channel, send, sendIfError }: JoinParams): Promise<void> {
  if (vc == null) {
    await sendIfError('Join a vc, bozo.')
    return
  }

  /* check if a player already exists for this guild. */
  const player = client.music.createPlayer(vc.guild.id)
  if (player.connected) {
    await sendIfError("I'm already connected to a vc.")
    return
  }

  /* set the queue channel so that we can send track start embeds. */
  player.queue.channel = channel

  /* connect to the vc. */
  player.connect(vc.id)

  await send(`Joined ${vc.toString()}`)
}
