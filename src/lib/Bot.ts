import { Client, Collection, GatewayDispatchEvents, type Message, type Snowflake, type TextChannel } from 'discord.js'
import { Node } from 'lavaclient'

import { type Command } from './command/Command'
import { aliases } from './aliases'
import { createMessageCommands } from './messageCommands'
import { type handleMessageType, type MessageCommandParams } from '../functions/types'
import { messageCommands2 } from './messageCommands2'
import { guildCheck, textChannelCheck } from './checks'
import logger from './Logger'


export function isKeyOfObject<T extends Object>(key: string | number | symbol, obj: T): key is keyof T {
  return key in obj
}

export class Bot extends Client {
  readonly music: Node
  readonly commands = new Collection<Snowflake, Command>()

  readonly messageCommands: Record<string, (params: MessageCommandParams) => Promise<void>> = {}
  readonly messageCommandsAliases: Record<string, string> = {}
  readonly prefix = process.env.PREFIX ?? '!'

  constructor() {
    super({
      intents: ['Guilds', 'GuildMessages', 'GuildVoiceStates', 'MessageContent']
    })

    // this.attachMessageCommands()
    this.attachMessageCommandsAliases()
    this.music = new Node({
      sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: process.env.LAVA_HOST ?? '',
        password: process.env.LAVA_PASS ?? '',
        port: 2333
      }
    })

    this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, async (data) => {
      await this.music.handleVoiceUpdate(data)
    })
    this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, async (data) => {
      await this.music.handleVoiceUpdate(data)
    })
    this.ws.on(GatewayDispatchEvents.MessageCreate, this.handleMessage.bind(this))
    this.ws.on(GatewayDispatchEvents.MessageUpdate, this.handleMessage.bind(this))

    this.login(process.env.BOT_TOKEN)
  }

  async getMessage(channel: TextChannel, id: string): Promise<Message<true> | null> {
    try {
      return await channel.messages.fetch(id)
    } catch (e) {
      return null
    }
  }

  async handleMessage(data: handleMessageType): Promise<void> {
    logger.debug(data)
    if (data.author == null || data.author.id === this.user?.id) return
    const maybeChannel = this.channels.cache.get(data.channel_id)
    if (maybeChannel == null) return
    const textChannel: TextChannel = maybeChannel as TextChannel
    const message = await this.getMessage(textChannel, data.id)
    if (data.content == null) return
    if (!data.content.startsWith(this.prefix)) return
    const contentWithoutPrefix = data.content.slice(this.prefix.length).trimStart()
    const commandOrAlias = contentWithoutPrefix.split(' ')[0].toLowerCase()
    const args = contentWithoutPrefix.slice(commandOrAlias.length).trimStart()
    const command =
      commandOrAlias in this.messageCommandsAliases ? this.messageCommandsAliases[commandOrAlias] : commandOrAlias
    if (isKeyOfObject(command, messageCommands2)) {
      const {
        checks = [],
        fn,
        schema,
        regex
      } = {
        ...{ schema: null, regex: null },
        ...messageCommands2[command]
      }
      const commonChecks = [guildCheck, textChannelCheck]
      const allChecks = [...commonChecks, ...checks]
      const guild = this.guilds.cache.get(data.guild_id ?? '')
      const sendFn = async (a: any): Promise<void> => {
        try {
          await message?.reply(a)
        } catch (e) {
          await textChannel?.send(a)
        }
      }
      const player = this.music.players.get(guild?.id ?? '')
      const current = player?.queue.current
      const partialParams = {
        userVc: guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel,
        guild,
        bot: this,
        userTextChannel: textChannel,
        send: sendFn,
        sendIfError: sendFn,
        player,
        requesterId: data.author.id,
        current
      }
      for (const check of allChecks) {
        if (!(await check(partialParams))) return
      }
      const paramsExtension = regex == null ? {} : new RegExp(regex).exec(args)?.groups ?? {}
      console.log(paramsExtension)
      const parsedParamsExtension =
        schema == null ? ({ success: true, data: {} } as const) : schema.safeParse(paramsExtension)
      if (!parsedParamsExtension.success) {
        await sendFn('Wrong arguments')
        return
      }
      await fn({
        ...partialParams,
        ...parsedParamsExtension.data
      })
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
