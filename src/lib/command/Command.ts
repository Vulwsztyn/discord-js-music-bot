import type { ApplicationCommand, ApplicationCommandData } from 'discord.js'
import type { CommandContext } from './CommandContext'
import type { Class } from 'type-fest'

export function command(data: ApplicationCommandData) {
  return (target: Class<Command>) => {
    return class extends target {
      constructor(...args: unknown[]) {
        super(data, ...args)
      }
    }
  }
}

export class Command {
  readonly data: ApplicationCommandData

  ref!: ApplicationCommand

  constructor(data: ApplicationCommandData) {
    this.data = data
  }

  async exec(ctx: CommandContext, options?: Record<string, number | string | boolean>): Promise<void> {
    void [ctx, options]
  }
}
