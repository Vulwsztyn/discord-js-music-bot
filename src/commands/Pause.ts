import { command, Command, genericSend, genericSendIfError, type CommandContext } from '@lib'
import { Pause as PauseFn } from '../functions'

@command({ name: 'pause', description: 'Pauses the playback.' })
export default class Pause extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await PauseFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
