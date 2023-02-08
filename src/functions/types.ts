import {
  Client,
  Guild,
  Message,
  TextChannel,
  VoiceBasedChannel,
} from 'discord.js'
import { MessageChannel } from '@lib'

export type CommonParams = {
  vc: VoiceBasedChannel | null | undefined
  send: (text: string, ...rest: string[]) => Promise<void>
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

export type MessageCommandParams = {
  data: any
  textChannel: TextChannel
  message: Message<true> | null
}
