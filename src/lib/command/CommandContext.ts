import {
  type Guild,
  EmbedBuilder,
  type Client,
  type CommandInteraction,
  type InteractionReplyOptions,
  type User
} from 'discord.js'
import { type Player } from 'lavaclient'
import type { MessageChannel } from '../index'

export class CommandContext {
  readonly interaction: CommandInteraction

  constructor(interaction: CommandInteraction) {
    this.interaction = interaction
  }

  get client(): Client {
    return this.interaction.client
  }

  get player(): Player | null {
    const res = this.guild != null && this.client.music.players.get(this.guild.id)
    if (res == null || res === false) return null
    return res
  }

  get guild(): Guild | null {
    return this.interaction.guild
  }

  get user(): User {
    return this.interaction.user
  }

  get channel(): MessageChannel {
    return this.interaction.channel as MessageChannel
  }

  /* overloads: not fetching the reply */
  reply(content: EmbedBuilder, options?: Omit<InteractionReplyOptions, 'embeds'>): Promise<void>
  reply(content: string, options?: Omit<InteractionReplyOptions, 'content'>): Promise<void>
  reply(options: InteractionReplyOptions): Promise<void>

  /* overloads: fetch reply */
  reply(content: EmbedBuilder, options?: Omit<InteractionReplyOptions, 'embeds'> & { fetchReply: true }): Promise<void>
  reply(
    content: string,
    options?: Omit<InteractionReplyOptions, 'content'> & {
      fetchReply: true
    }
  ): Promise<void>
  reply(options: InteractionReplyOptions & { fetchReply: true }): Promise<void>

  /* actual method */
  async reply(
    content: string | EmbedBuilder | InteractionReplyOptions,
    options: InteractionReplyOptions = {}
  ): Promise<void> {
    if (typeof content === 'string' || content instanceof EmbedBuilder) {
      await this.interaction.reply({
        [typeof content === 'string' ? 'content' : 'embeds']: typeof content === 'string' ? content : [content],
        ...options
      })
      return
    }

    await this.interaction.reply(content)
  }
}
