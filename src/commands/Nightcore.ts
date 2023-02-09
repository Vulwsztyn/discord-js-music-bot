import { command, Command, type CommandContext, Utils } from '@lib'
import { Nightcore as NightcoreFn } from '../functions'

@command({
  name: 'nightcore',
  description: 'Enabled the nightcore filter in this guild.'
})
export default class Nightcore extends Command {
  async exec(ctx: CommandContext): Promise<void> {
    await NightcoreFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
