import { command, Command, type CommandContext, Utils } from '@lib'
import { Ping as PingFn } from '../functions'

@command({ name: 'ping', description: 'Shows the latency of the bot.' })
export default class Ping extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await PingFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
