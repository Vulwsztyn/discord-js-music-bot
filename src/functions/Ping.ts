import { PingParams } from './types'

export async function Ping({ send, client }: PingParams) {
  send(`Pong! **Heartbeat:** *${Math.round(client.ws.ping)}ms*`)
}
