import { command, Command, type CommandContext, genericSend, genericSendIfError } from '@lib'
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
      send: genericSend(ctx),
      sendIfError: genericSendIfError(ctx),
      guild: ctx.guild
    })
  }
}
