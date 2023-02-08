import { command, Command, CommandContext, Utils } from '@lib'
import { Skip as SkipFn } from '../functions'

@command({ name: 'skip', description: 'Skips the current song.' })
export default class Skip extends Command {
  async exec(ctx: CommandContext) {
    await SkipFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: (t: string) => ctx.reply(Utils.embed(t)),
      sendIfError: (t: string) =>
        ctx.reply(Utils.embed(t), { ephemeral: true }),
      guild: ctx.guild,
    })
  }
}
