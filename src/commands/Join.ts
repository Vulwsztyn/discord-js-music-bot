import { command, Command, type CommandContext, genericSend, genericSendIfError } from '@lib'
import { Join as JoinFn } from '../functions'

@command({ name: 'join', description: "Joins the member's voice channel." })
export default class Join extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await JoinFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
