import { type PingParams } from './types'

export async function Ping({ send, client }: PingParams): Promise<void> {
  await send(`Pong! **Heartbeat:** *${Math.round(client.ws.ping)}ms*`)
}
