import { type Client, type Guild, type Message, type TextChannel, type VoiceBasedChannel } from 'discord.js'
import { type MessageChannel } from '@lib'

export interface CommonParams {
  vc: VoiceBasedChannel | null | undefined
  send: (text: string, ...rest: any[]) => Promise<void>
  sendIfError: (text: string, ...rest: string[]) => Promise<void>
  channel: MessageChannel
  client: Client
  guild: Guild | null | undefined
}

export type JoinParams = CommonParams

export type PlayParams = CommonParams & {
  query: string
  next?: boolean
  requester?: string
}

export type SkipParams = CommonParams

export type SeekParams = CommonParams & {
  position: string
  add: boolean
}

export type LeaveParams = CommonParams

export type NightcoreParams = CommonParams & {
  speed?: number
  pitch?: number
  rate?: number
}

export type PingParams = CommonParams

export type QueueParams = CommonParams

export type RemoveParams = CommonParams & {
  index: number
}

export type PauseParams = CommonParams

export type ResumeParams = CommonParams

export interface MessageCommandParams {
  data: any
  textChannel: TextChannel
  message: Message<true> | null
}
