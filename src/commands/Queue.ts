import { command, Command, CommandContext, Utils } from '@lib'
import { Queue as QueueFn } from '../functions'

@command({
  name: 'queue',
  description: 'Shows the tracks that are in the queue.',
})
export default class Queue extends Command {
  async exec(ctx: CommandContext) {
    await QueueFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: (t: string, str: string) =>
        ctx.reply(
          Utils.embed({
            description: str,
            title: t,
          })
        ),
      sendIfError: (t: string) =>
        ctx.reply(Utils.embed(t), { ephemeral: true }),
      guild: ctx.guild,
    })
  }
}
