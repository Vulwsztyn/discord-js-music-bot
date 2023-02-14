import { command, Command, type CommandContext, Utils } from '@lib'
import { Resume as ResumeFn } from '../functions'

@command({ name: 'resume', description: 'Resumes the playback.' })
export default class Resume extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await ResumeFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
