import { type z } from 'zod'
import { Ping2 } from '../functions2/ping'
import { type Check, connectedCheck, currentCheck, queueCheck, textChannelCheck, voiceChannelCheck } from './checks'
import {
  TextChannelCheckParams,
  EchoParamsSchema,
  CommonParams2,
  NightcoreParamsSchema,
  PlayParamsSchema,
  RemoveParamsSchema,
  SeekParamsSchema
} from '../functions2/types'
import { Echo } from '../functions2/echo'
import { Join } from '../functions2/join'
import { Leave } from '../functions2/leave'
import { Nightcore } from '../functions2/nightcore'
import { Pause } from '../functions2/pause'
import { Play } from '../functions2/play'
import { Queue } from '../functions2/queue'
import { Remove } from '../functions2/remove'
import { Resume } from '../functions2/resume'
import { Seek } from '../functions2/seek'
import { Skip } from '../functions2/skip'

interface MyCommandBase {
  checks?: Check[]
  fn: (params: any) => Promise<void>
}

type MyCommand =
  | MyCommandBase
  | (MyCommandBase & {
    schema: z.ZodSchema
    regex: string
  })

const playGeneric = {
  schema: PlayParamsSchema,
  checks: [voiceChannelCheck],
  regex: '^(?<query>.*)$'
}

const seekGeneric = {
  schema: SeekParamsSchema,
  checks: [voiceChannelCheck, connectedCheck, currentCheck],
  regex: '^(?<position>\\d+)$'
}

export const messageCommands2: Record<string, MyCommand> = {
  ping: {
    fn: Ping2
  },
  echo: {
    schema: EchoParamsSchema,
    fn: Echo,
    regex: '^(?<msg>.*)$'
  },
  join: {
    checks: [voiceChannelCheck],
    fn: Join
  },
  leave: {
    checks: [connectedCheck],
    fn: Leave
  },
  nightcore: {
    schema: NightcoreParamsSchema,
    checks: [voiceChannelCheck, connectedCheck],
    fn: Nightcore,
    regex: '^(?<speed>\\S*)\\s(?<pitch>\\S*)\\s(?<rate>\\S*).*$'
  },
  pause: {
    checks: [voiceChannelCheck, connectedCheck],
    fn: Pause
  },
  piwo: {
    checks: playGeneric.checks,
    fn: async (arg: any) => {
      await Play({ next: false })({
        query: 'https://www.youtube.com/watch?v=hbsT9OOqvzw',
        ...arg
      })
    }
  },
  piwonext: {
    checks: playGeneric.checks,
    fn: async (arg: any) => {
      await Play({ next: true })({
        query: 'https://www.youtube.com/watch?v=hbsT9OOqvzw',
        ...arg
      })
    }
  },
  play: {
    ...playGeneric,
    fn: Play({ next: false })
  },
  playnext: {
    ...playGeneric,
    fn: Play({ next: true })
  },
  queue: {
    checks: [connectedCheck, queueCheck],
    fn: Queue
  },
  remove: {
    schema: RemoveParamsSchema,
    regex: '^(?<index>\\d+)$',
    checks: [connectedCheck],
    fn: Remove
  },
  resume: {
    checks: [connectedCheck, currentCheck],
    fn: Resume
  },
  seek: {
    ...seekGeneric,
    fn: Seek({})
  },
  back: {
    ...seekGeneric,
    fn: Seek({ add: true, multiplier: -1 })
  },
  forward: {
    ...seekGeneric,
    fn: Seek({ add: true })
  },
  skip: {
    checks: [connectedCheck, currentCheck],
    fn: Skip
  }
}
