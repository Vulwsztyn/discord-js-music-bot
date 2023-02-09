import { command, Command, type CommandContext, Utils } from '@lib'

import { ApplicationCommandOptionType } from 'discord.js'
import { Seek as SeekFn } from '../functions'

@command({
  name: 'back',
  description: 'Backs current song',
  options: [
    {
      name: 'position',
      description: 'How much to forward (in seconds)',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ]
})
export default class Back extends Command {
  async exec(ctx: CommandContext, { position }: { position: string }): Promise<void> {
    await SeekFn({
      vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
      client: ctx.client,
      channel: ctx.channel,
      send: Utils.genericSend(ctx),
      sendIfError: Utils.genericSendIfError(ctx),
      guild: ctx.guild,
      position: `-${position}`,
      add: true
    })
  }
}
