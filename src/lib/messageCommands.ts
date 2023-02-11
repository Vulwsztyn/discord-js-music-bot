import { type CommandParamsAll, type CommonParams, type MessageCommandParams } from '../functions/types'
import { type MessagePayload, type MessageReplyOptions, type Client } from 'discord.js'
import { embedFn } from './Utils'
import {
  Join as JoinFn,
  Leave,
  Nightcore,
  Pause,
  Ping,
  Play as PlayFn,
  Queue,
  Remove,
  Resume,
  Seek,
  Skip as SkipFn
} from '../functions'

interface MultivariantFn {
  Fn(args: CommandParamsAll): Promise<void>
  // TODO: remove this and @typescript-eslint/method-signature-style
}

type sendFnParam = string | MessagePayload | MessageReplyOptions

export const createMessageCommands = (client: Client): Record<string, MultivariantFn['Fn']> => {
  const genericFn =
    (fn: (args: CommonParams) => Promise<void>) =>
      async ({ data, textChannel, message }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id ?? '')
        const vc = guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel

        const sendFn = async (a: sendFnParam): Promise<void> => {
          try {
            await message?.reply(a)
          } catch (e) {
            await textChannel?.send(a)
          }
        }
        const send = async (t: string): Promise<void> => {
          await sendFn({ embeds: [embedFn(t)] })
        }
        await fn({
          vc,
          client,
          channel: textChannel,
          send,
          sendIfError: send,
          guild
        })
      }
  const playFn =
    (next: boolean, override?: string) =>
      async ({ data, textChannel, message }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id ?? '')
        const vc = guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel
        const sendFn = async (a: sendFnParam): Promise<void> => {
          try {
            await message?.reply(a)
          } catch (e) {
            await textChannel?.send(a)
          }
        }
        const send = async (t: string, t2: string): Promise<void> => {
          await sendFn({ embeds: [embedFn(`${t} ${t2}`)] })
        }
        const query = override ?? data.content?.split(' ').slice(1).join(' ') ?? ''
        if (query === '') {
          await Resume({
            vc,
            client,
            channel: textChannel,
            send,
            sendIfError: send,
            guild
          })
        } else {
          await PlayFn({
            vc,
            client,
            channel: textChannel,
            send,
            sendIfError: send,
            query,
            next,
            guild
          })
        }
      }

  const seekFn =
    (add: boolean, prefix = '') =>
      async ({ data, textChannel, message }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id ?? '')
        const vc = guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel
        const sendFn = async (a: sendFnParam): Promise<void> => {
          try {
            await message?.reply(a)
          } catch (e) {
            await textChannel?.send(a)
          }
        }
        const send = async (t: string): Promise<void> => {
          await sendFn({ embeds: [embedFn(t)] })
        }
        await Seek({
          vc,
          client,
          channel: textChannel,
          send,
          sendIfError: send,
          guild,
          position: prefix + (data.content?.split(' ').slice(1).join(' ') ?? ''),
          add
        })
      }

  return {
    join: genericFn(JoinFn),
    seek: seekFn(false),
    forward: seekFn(true),
    back: seekFn(true, '-'),
    leave: genericFn(Leave),
    nightcore: genericFn(Nightcore),
    ping: genericFn(Ping),
    play: playFn(false),
    playnext: playFn(true),
    skip: genericFn(SkipFn),
    piwo: async ({ data, textChannel, message }: MessageCommandParams) => {
      await playFn(false, 'https://www.youtube.com/watch?v=hbsT9OOqvzw')({ data, textChannel, message })
    },
    piwonext: async ({ data, textChannel, message }: MessageCommandParams) => {
      await playFn(true, 'https://www.youtube.com/watch?v=hbsT9OOqvzw')({ data, textChannel, message })
    },
    queue: async ({ data, textChannel, message }: MessageCommandParams) => {
      const guild = client.guilds.cache.get(data.guild_id ?? '')
      const vc = guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel
      const sendFn = async (a: sendFnParam): Promise<void> => {
        try {
          await message?.reply(a)
        } catch (e) {
          await textChannel?.send(a)
        }
      }
      const send = async (t: string, t2: string): Promise<void> => {
        await sendFn({
          embeds: [
            embedFn({
              description: t2,
              title: t
            })
          ]
        })
      }
      await Queue({
        vc,
        client,
        channel: textChannel,
        send,
        sendIfError: send,
        guild
      })
    },
    remove: async ({ data, textChannel, message }: MessageCommandParams) => {
      const guild = client.guilds.cache.get(data.guild_id ?? '')
      const vc = guild?.voiceStates.cache.get(data.author?.id ?? '')?.channel
      const sendFn = async (a: sendFnParam): Promise<void> => {
        try {
          await message?.reply(a)
        } catch (e) {
          await textChannel?.send(a)
        }
      }
      const send = async (t: string, t2: string): Promise<void> => {
        await sendFn({ embeds: [embedFn(`${t} ${t2}`)] })
      }
      await Remove({
        vc,
        client,
        channel: textChannel,
        send,
        sendIfError: send,
        index: parseInt(data.content?.split(' ').slice(1).join(' ') ?? '0', 10),
        guild
      })
    },
    pause: genericFn(Pause),
    resume: genericFn(Resume)
  }
}
