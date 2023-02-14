import { type CommonParams2Validated } from './types'

export async function Leave({ bot, player, send }: CommonParams2Validated): Promise<void> {
  await send(`Left <#${player.channelId}>`)
  player.disconnect()
  await bot.music.destroyPlayer(player.guildId)
}
