import { command, Command, embedFn, genericSendIfError, type CommandContext } from '@lib'
import { Queue as QueueFn } from '../functions'

@command({
  name: 'queue',
  description: 'Shows the tracks that are in the queue.'
})
export default class Queue extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await QueueFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: async (t: string, str: string): Promise<void> => {
        await ctx.reply(
          embedFn({
            description: str,
            title: t
          })
        )
      },
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
