import { APIMessage, Client, Collection, GatewayDispatchEvents, type Message, type Snowflake, type TextChannel } from 'discord.js'
import { Node } from 'lavaclient'

import { type Command } from './command/Command'
import { aliases } from './aliases'
import { createMessageCommands } from './messageCommands'
import { type MessageCommandParams } from '../functions/types'

export class Bot extends Client {
  readonly music: Node
  readonly commands = new Collection<Snowflake, Command>()

  readonly messageCommands: Record<string, (params: MessageCommandParams) => Promise<void>> = {}
  readonly messageCommandsAliases: Record<string, string> = {}
  readonly prefix = process.env.PREFIX ?? '!'

  constructor() {
    super({
      intents: ['Guilds', 'GuildMessages', 'GuildVoiceStates', 'MessageContent'],
    })

    this.attachMessageCommands()
    this.attachMessageCommandsAliases()
    this.music = new Node({
      sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: process.env.LAVA_HOST ?? '',
        password: process.env.LAVA_PASS ?? '',
        port: 2333,
      },
    })

    this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, async (data) => {
      await this.music.handleVoiceUpdate(data)
    })
    this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, async (data) => {
      await this.music.handleVoiceUpdate(data)
    })
    this.ws.on(GatewayDispatchEvents.MessageCreate, this.handleMessage.bind(this))
    this.ws.on(GatewayDispatchEvents.MessageUpdate, this.handleMessage.bind(this))
  }

  async getMessage(channel: TextChannel, id: string): Promise<Message<true> | null> {
    try {
      return await channel.messages.fetch(id)
    } catch (e) {
      return null
    }
  }

  async handleMessage(data: APIMessage): Promise<void> {
    if (!data.author || data.author.id === this.user?.id) return
    const maybeChannel = this.channels.cache.get(data.channel_id)
    if (!maybeChannel) return
    const textChannel: TextChannel = maybeChannel as TextChannel
    const message = await this.getMessage(textChannel, data.id)
    if (data.content.startsWith(this.prefix)) {
      const commandOrAlias = data.content.split(' ')[0].slice(this.prefix.length)
      const command =
        commandOrAlias in this.messageCommandsAliases ? this.messageCommandsAliases[commandOrAlias] : commandOrAlias
      if (command in this.messageCommands) {
        await this.messageCommands[command]({
          data,
          textChannel,
          message,
        })
      }
    }
  }

  attachMessageCommands(): void {
    const messageCommands = createMessageCommands(this)
    Object.keys(messageCommands).forEach((command) => {
      this.messageCommands[command] = messageCommands[command]
    })
  }

  attachMessageCommandsAliases(): void {
    Object.keys(aliases).forEach((alias) => {
      this.messageCommandsAliases[alias] = aliases[alias]
    })
  }
}

declare module 'discord.js' {
  interface Client {
    readonly music: Node
  }
}
