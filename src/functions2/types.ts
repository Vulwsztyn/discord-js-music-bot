import { type Guild, type VoiceBasedChannel } from 'discord.js'
import { type Bot, type MessageChannel } from '@lib'
import { z } from 'zod'
import { type Node, type Player } from 'lavaclient'
import { type Song } from '@lavaclient/queue'

const numericCore = z.string().regex(/^[+-]?(\d*[.])?\d+$/, { message: 'not a number' })
const intigerishCore = z.string().regex(/^\d+$/, { message: 'not an int' })
export const numeric = () => numericCore.transform(Number)
export const intigerish = () => intigerishCore.transform((x) => parseInt(x, 10))

export const optionalNumeric = () => numericCore.optional().transform((x) => (x == null ? undefined : Number(x)))

type SendFnType = (text: string, ...rest: any[]) => Promise<void>

export interface CommonParams2 {
  userVc: VoiceBasedChannel | null | undefined
  userTextChannel: MessageChannel
  bot: Bot
  guild: Guild | null | undefined
  send: SendFnType
  sendIfError: SendFnType
  player: Player<Node> | undefined
  requesterId: string
  current: Song | null | undefined
}

export type CommonParams2Validated = CommonParams2 & {
  userVc: VoiceBasedChannel
  guild: Guild
  player: Player<Node>
}

export type TextChannelCheckParams = Omit<CommonParams2, 'send' | 'sendIfError'>

export const EchoParamsSchema = z.object({
  msg: z.string().min(1)
})

export type EchoParams = z.infer<typeof EchoParamsSchema> & CommonParams2Validated

export const NightcoreParamsSchema = z.object({
  speed: optionalNumeric(),
  pitch: optionalNumeric(),
  rate: optionalNumeric()
})

export type NightcoreParams = z.infer<typeof NightcoreParamsSchema> & CommonParams2Validated

export const PlayParamsSchema = z.object({
  query: z.string().min(1)
})

export type PlayParams = z.infer<typeof PlayParamsSchema> & CommonParams2Validated

export const RemoveParamsSchema = z.object({
  index: intigerish()
})

export type RemoveParams = z.infer<typeof RemoveParamsSchema> & CommonParams2Validated

export const SeekParamsSchema = z.object({
  position: z.string().min(1)
})

export type SeekParams = z.infer<typeof SeekParamsSchema> & CommonParams2Validated
