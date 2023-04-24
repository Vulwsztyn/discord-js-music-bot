import { command, Command, embedFn, genericSendIfError, type CommandContext } from '@lib'
import { ApplicationCommandOptionType } from 'discord.js'
import { Remove as RemoveFn } from '../functions'

@command({
  name: 'remove',
  description: 'Removes a track from the queue.',
  options: [
    {
      name: 'index',
      description: 'The index of the track to remove.',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }
  ]
})
export default class Remove extends Command {
  async exec(ctx: CommandContext, { index }: { index: number }): Promise<void> {
    await RemoveFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: async (t: string, str: string) => {
        await ctx.reply(
          embedFn({
            description: str,
            title: t
          })
        )
      },
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild,
      index
    })
  }
}
