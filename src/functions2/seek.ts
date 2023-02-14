import { millisecondsToString, stringToMilliseconds } from '@lib'

import { type SeekParams } from './types'

export const Seek =
  ({ add = false, multiplier = 1 }: { add?: boolean, multiplier?: 1 | -1 }) =>
    async ({ current, sendIfError, send, player, position }: SeekParams): Promise<void> => {
      const positionNumerised = (add ? player.position ?? 0 : 0) + multiplier * stringToMilliseconds(position)
      if (isNaN(positionNumerised)) {
        await sendIfError('Position must be a number')
        return
      }
      await player.seek(positionNumerised)

      const positionHumanReadable = millisecondsToString(positionNumerised)

      await send(`Sought ${current?.title} to ${positionHumanReadable}`)
    }
