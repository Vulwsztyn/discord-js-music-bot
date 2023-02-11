import { command, Command, embedFn, genericSendIfError, type CommandContext } from '@lib'

import { ApplicationCommandOptionType } from 'discord.js'
import { Play as PlayFn } from '../functions'

@command({
  name: 'play',
  description: 'Plays a song in the current vc.',
  options: [
    {
      name: 'query',
      description: 'The search query.',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'next',
      description: 'Whether to add the results to the top of the queue.',
      type: ApplicationCommandOptionType.Boolean,
      required: false
    }
  ]
})
export default class Play extends Command {
  async exec(ctx: CommandContext, { query, next }: { query: string, next: boolean }): Promise<void> {
    await PlayFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: async (t: string, t2?: string, started: boolean = false) => {
        await ctx.reply(
          embedFn({
            description: t,
            ...(t2 != null ? { footer: { text: t2 } } : {})
          }),
          { ephemeral: !started }
        )
      },
      sendIfError: genericSendIfError(ctx),
      query,
      next,
      requester: ctx.user.id,
      guild: ctx.guild
    })
  }
}
