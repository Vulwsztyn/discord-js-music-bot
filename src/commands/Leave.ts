import { command, Command, type CommandContext, genericSend, genericSendIfError } from '@lib'
import { Leave as LeaveFn } from '../functions'

@command({
  name: 'leave',
  description: 'Leaves the VC that the bot is currently in.'
})
export default class Leave extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await LeaveFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
