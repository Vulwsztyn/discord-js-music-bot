import { command, Command, type CommandContext, Utils } from '@lib'
import { Pause as PauseFn } from '../functions'

@command({ name: 'pause', description: 'Pauses the playback.' })
export default class Pause extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await PauseFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
