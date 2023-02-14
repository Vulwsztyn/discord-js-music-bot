import { CommonParams2, type EchoParams } from './types'

export async function Echo({ send, msg }: EchoParams): Promise<void> {
  await send(msg)
}
