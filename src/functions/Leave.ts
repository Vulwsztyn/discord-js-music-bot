import { type LeaveParams } from './types'

export async function Leave({ vc, sendIfError, send, client, guild }: LeaveParams): Promise<void> {
  /* check if a player exists for this guild. */
  if (guild == null) {
    await sendIfError('Guild not found')
    return
  }
  const player = client.music.players.get(guild.id)
  if (player?.connected !== true) {
    await sendIfError("I couldn't find a player for this guild.")
    return
  }

  /* check if the user is in the player's voice channel. */
  if (vc == null || player.channelId !== vc.id) {
    await sendIfError("You're not in my voice channel, bozo.")
    return
  }

  await send(`Left <#${player.channelId}>`)

  /* leave the player's voice channel. */
  player.disconnect()
  await client.music.destroyPlayer(player.guildId)
}
