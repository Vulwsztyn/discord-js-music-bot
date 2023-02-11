import {
  type GatewayMessageCreateDispatchData,
  type GatewayMessageUpdateDispatchData,
  type Client,
  type Guild,
  type Message,
  type TextChannel,
  type VoiceBasedChannel
} from 'discord.js'
import { type MessageChannel } from '@lib'

type SendFnType = (text: string, ...rest: any[]) => Promise<void>

export type handleMessageType = GatewayMessageCreateDispatchData | GatewayMessageUpdateDispatchData

export interface CommonParams {
  vc: VoiceBasedChannel | null | undefined
  send: SendFnType
  sendIfError: SendFnType
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
  data: handleMessageType
  textChannel: TextChannel
  message: Message<true> | null
}

export type CommandParamsAll =
  | MessageCommandParams
  | CommonParams
  | JoinParams
  | PlayParams
  | SkipParams
  | SeekParams
  | LeaveParams
  | NightcoreParams
  | PingParams
  | QueueParams
  | RemoveParams
  | PauseParams
  | ResumeParams
