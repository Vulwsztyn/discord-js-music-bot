import { type CommonParams2 } from './types'

export async function Ping2({ send, bot }: CommonParams2): Promise<void> {
  await send(`Pong! **Heartbeat:** *${Math.round(bot.ws.ping)}ms*`)
}
