import { command, Command, genericSend, genericSendIfError, type CommandContext } from '@lib'
import { Resume as ResumeFn } from '../functions'

@command({ name: 'resume', description: 'Resumes the playback.' })
export default class Resume extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await ResumeFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
