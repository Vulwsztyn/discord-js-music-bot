import { type CommonParams2Validated } from './types'
import { TextChannel, type VoiceBasedChannel, VoiceChannel } from 'discord.js'
import { type Node, type Player } from 'lavaclient'
import { type Bot, type MessageChannel } from '@lib'

export const createPlayer = async ({
  userTextChannel,
  userVc,
  bot
}: {
  userTextChannel: MessageChannel
  userVc: VoiceBasedChannel
  bot: Bot
}): Promise<Player<Node>> => {
  const player = bot.music.createPlayer(userVc.guild.id)
  player.queue.channel = userTextChannel
  player.connect(userVc.id)
  return player
}

export async function Join({ userVc, bot, userTextChannel, send }: CommonParams2Validated): Promise<void> {
  await createPlayer({ userVc, bot, userTextChannel })
  await send(`Joined ${userVc.toString()}`)
}
