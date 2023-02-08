import { JoinParams } from './types'

export async function Join({
  vc,
  client,
  channel,
  send,
  sendIfError,
}: JoinParams) {
  if (!vc) {
    return sendIfError('Join a vc, bozo.')
  }

  /* check if a player already exists for this guild. */
  const player = client.music.createPlayer(vc.guild.id)
  if (player.connected) {
    return sendIfError("I'm already connected to a vc.")
  }

  /* set the queue channel so that we can send track start embeds. */
  player.queue.channel = channel

  /* connect to the vc. */
  await player.connect(vc.id)

  await send(`Joined ${vc}`)
}
