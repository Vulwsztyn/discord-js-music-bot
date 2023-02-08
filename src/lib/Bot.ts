import {
  Client,
  Collection,
  GatewayDispatchEvents,
  Message,
  Snowflake,
  TextChannel,
} from 'discord.js'
import { Node } from 'lavaclient'

import { Command } from './command/Command'
import { aliases } from './aliases'
import { createMessageCommands } from './messageCommands'
import { MessageCommandParams } from '../functions/types'

export class Bot extends Client {
  readonly music: Node
  readonly commands: Collection<Snowflake, Command> = new Collection()

  readonly messageCommands: Record<
    string,
    (params: MessageCommandParams) => Promise<void>
  > = {}
  readonly messageCommandsAliases: Record<string, string> = {}
  readonly prefix = process.env.PREFIX || '!'

  constructor() {
    super({
      intents: [
        'Guilds',
        'GuildMessages',
        'GuildVoiceStates',
        'MessageContent',
      ],
    })

    this.attachMessageCommands()
    this.attachMessageCommandsAliases()
    this.music = new Node({
      sendGatewayPayload: (id, payload) =>
        this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: process.env.LAVA_HOST || '',
        password: process.env.LAVA_PASS || '',
        port: 2333,
      },
    })

    this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) =>
      this.music.handleVoiceUpdate(data)
    )
    this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) =>
      this.music.handleVoiceUpdate(data)
    )
    this.ws.on(
      GatewayDispatchEvents.MessageCreate,
      this.handleMessage.bind(this)
    )
    this.ws.on(
      GatewayDispatchEvents.MessageUpdate,
      this.handleMessage.bind(this)
    )
  }

  async getMessage(
    channel: TextChannel,
    id: string
  ): Promise<Message<true> | null> {
    try {
      return await channel.messages.fetch(id)
    } catch (e) {
      return null
    }
  }

  async handleMessage(data: any) {
    if (!data.author || data.author.id === this.user?.id) return
    const textChannel = this.channels.cache.get(data.channel_id) as TextChannel
    const message = await this.getMessage(textChannel, data.id)
    if (data.content.startsWith(this.prefix)) {
      const commandOrAlias = data.content
        .split(' ')[0]
        .slice(this.prefix.length)
      const command =
        commandOrAlias in this.messageCommandsAliases
          ? this.messageCommandsAliases[commandOrAlias]
          : commandOrAlias
      if (command in this.messageCommands) {
        await this.messageCommands[command]({
          data,
          textChannel,
          message,
        })
      }
    }
  }

  attachMessageCommands() {
    const messageCommands = createMessageCommands(this)
    Object.keys(messageCommands).forEach((command) => {
      this.messageCommands[command] = messageCommands[command]
    })
  }

  attachMessageCommandsAliases() {
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
