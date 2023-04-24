import { type CommonParams2, TextChannelCheckParams } from '../functions2/types'

export type Check = (params: CommonParams2) => Promise<boolean>
export const textChannelCheck: Check = async (params) => {
  return params.userTextChannel != null
}

export const guildCheck: Check = async ({ guild, sendIfError }) => {
  if (guild == null) {
    await sendIfError('Guild not found. This should not happen.')
    return false
  }
  return true
}

export const voiceChannelCheck: Check = async ({ userVc, guild, bot, sendIfError }) => {
  if (userVc?.id == null) {
    await sendIfError('You must be in a voice channel to use this command')
    return false
  }
  const botChannel = bot.music.players.get(guild?.id ?? '')?.channelId
  if (botChannel == null) return true
  if (botChannel !== userVc.id) {
    await sendIfError(`I'm already in a voice channel. Join <#${botChannel}>`)
    return false
  }
  return true
}

export const connectedCheck: Check = async ({ bot, guild, sendIfError }) => {
  const player = bot.music.players.get(guild?.id ?? '')
  if (player?.connected !== true) {
    await sendIfError("I couldn't find a player for this guild.")
    return false
  }
  return true
}

export const queueCheck: Check = async ({ player, sendIfError }) => {
  if (player == null || player.queue.tracks.length === 0) {
    await sendIfError('There are no tracks in the queue.')
    return false
  }
  return true
}

export const currentCheck: Check = async ({ current, sendIfError }) => {
  if (current == null) {
    await sendIfError('There is no current track.')
    return false
  }
  return true
}
