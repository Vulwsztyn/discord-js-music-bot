import { command, Command, genericSend, genericSendIfError, type CommandContext } from '@lib'
import { Ping as PingFn } from '../functions'

@command({ name: 'ping', description: 'Shows the latency of the bot.' })
export default class Ping extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await PingFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
