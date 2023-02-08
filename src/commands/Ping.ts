import { command, Command, CommandContext, Utils } from '@lib'
import { Ping as PingFn } from '../functions'

@command({ name: 'ping', description: 'Shows the latency of the bot.' })
export default class Ping extends Command {
  async exec(ctx: CommandContext) {
    await PingFn({
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
