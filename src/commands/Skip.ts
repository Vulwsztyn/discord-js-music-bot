import { command, Command, genericSend, genericSendIfError, type CommandContext } from '@lib'
import { Skip as SkipFn } from '../functions'

@command({ name: 'skip', description: 'Skips the current song.' })
export default class Skip extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await SkipFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
