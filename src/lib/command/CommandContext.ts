import {
  type Guild,
  type Message,
  EmbedBuilder,
  type InteractionResponse,
  type Client,
  type CommandInteraction,
  type InteractionReplyOptions,
  type User
} from 'discord.js'
import type { APIMessage } from 'discord-api-types/v10'
import { type Player } from 'lavaclient'
import type { MessageChannel } from '../index'

type replyReturnType = Message | APIMessage | InteractionResponse<boolean> | void

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
  reply(content: EmbedBuilder, options?: Omit<InteractionReplyOptions, 'embeds'>): Promise<replyReturnType>
  reply(content: string, options?: Omit<InteractionReplyOptions, 'content'>): Promise<replyReturnType>
  reply(options: InteractionReplyOptions): Promise<replyReturnType>

  /* overloads: fetch reply */
  reply(
    content: EmbedBuilder,
    options?: Omit<InteractionReplyOptions, 'embeds'> & { fetchReply: true }
  ): Promise<Message | APIMessage>
  reply(
    content: string,
    options?: Omit<InteractionReplyOptions, 'content'> & {
      fetchReply: true
    }
  ): Promise<Message | APIMessage>
  reply(options: InteractionReplyOptions & { fetchReply: true }): Promise<Message | APIMessage>

  /* actual method */
  async reply(
    content: string | EmbedBuilder | InteractionReplyOptions,
    options: InteractionReplyOptions = {}
  ): Promise<Message | APIMessage | InteractionResponse<boolean>> {
    if (typeof content === 'string' || content instanceof EmbedBuilder) {
      return await this.interaction.reply({
        [typeof content === 'string' ? 'content' : 'embeds']: typeof content === 'string' ? content : [content],
        ...options
      })
    }

    return await this.interaction.reply(content)
  }
}
