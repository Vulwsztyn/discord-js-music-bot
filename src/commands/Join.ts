import { command, Command, type CommandContext, Utils } from '@lib'
import { Join as JoinFn } from '../functions'

@command({ name: 'join', description: "Joins the member's voice channel." })
export default class Join extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await JoinFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
