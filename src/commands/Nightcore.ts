import { command, Command, CommandContext, Utils } from '@lib'
import { Nightcore as NightcoreFn } from '../functions'

@command({
  name: 'nightcore',
  description: 'Enabled the nightcore filter in this guild.',
})
export default class Nightcore extends Command {
  async exec(ctx: CommandContext) {
    await NightcoreFn({
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
