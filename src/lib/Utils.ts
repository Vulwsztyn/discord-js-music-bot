import { EmbedBuilder, type EmbedData, type NewsChannel, type TextChannel, type ThreadChannel } from 'discord.js'
import { lstatSync, readdirSync } from 'fs'
import { join } from 'path'

import type { Command, CommandContext } from '@lib'
import type { Bot } from './Bot'

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel

export abstract class Utils {
  static PRIMARY_COLOR = 0xfff269

  static embedded(embed: EmbedData | string): { embeds: EmbedBuilder[] } {
    return { embeds: [Utils.embed(embed)] }
  }

  static embed(embed: EmbedData | string): EmbedBuilder {
    const options: EmbedData = typeof embed === 'string' ? { description: embed } : embed
    options.color ??= Utils.PRIMARY_COLOR

    return new EmbedBuilder(options)
  }

  static walk(directory: string): string[] {
    function read(dir: string, files: string[] = []): string[] {
      for (const item of readdirSync(dir)) {
        const path = join(dir, item)
        const stat = lstatSync(path)
        if (stat.isDirectory()) {
          files.concat(read(path, files))
        } else if (stat.isFile()) {
          files.push(path)
        }
      }

      return files
    }

    return read(directory)
  }

  static async syncCommands(client: Bot, dir: string, soft = false): Promise<void> {
    const commands: Command[] = []
    for (const path of Utils.walk(dir)) {
      const { default: Command } = await import(path)
      if (!Command) {
        continue
      }

      commands.push(new Command())
    }
    if (client.application == null) return
    const commandManager = client.application.commands
    const existing = await commandManager.fetch()

    /* do soft sync */
    if (soft) {
      for (const command of commands) {
        const ref = existing.find((c) => c.name === command.data.name)
        if (ref == null) {
          continue
        }

        command.ref = ref
        client.commands.set(ref.id, command)
      }

      console.log(`[discord] slash commands: registered ${client.commands.size}/${commands.length} commands.`)
      return
    }

    /* get the slash commands to add, update, or remove. */
    const adding = commands.filter((c) => existing.every((e) => e.name !== c.data.name))
    const updating = commands.filter((c) => existing.some((e) => e.name === c.data.name))
    const removing = [...existing.filter((e) => commands.every((c) => c.data.name !== e.name)).values()]

    console.log(
      `[discord] slash commands: removing ${removing.length}, adding ${adding.length}, updating ${updating.length}`
    )

    /* update/create slash commands. */
    const creating = [...adding, ...updating]
    const created = await commandManager.set(creating.map((c) => c.data))

    for (const command of creating) {
      const ref = created.find((c) => c.name === command.data.name)
      if (ref == null) continue
      command.ref = ref
      client.commands.set(command.ref.id, command)
    }
  }

  static stringToMilliseconds(str: string): number {
    const [secondsWithMicro, minutesStr, hoursStr] = str.split(':').reverse()
    const [secondsStr, microsecondsStr] = secondsWithMicro.split('.')
    const hours = hoursStr != null ? parseInt(hoursStr) : 0
    const minutes = minutesStr != null ? parseInt(minutesStr) : 0
    const seconds = secondsStr != null ? parseInt(secondsStr) : 0
    const milliseconds = microsecondsStr != null ? parseInt(microsecondsStr.padEnd(4, '0')) : 0
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds
  }

  static millisecondsToString(milliseconds: number): string {
    const seconds = milliseconds / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    const format = (num: number): string => Math.floor(num).toString().padStart(2, '0')
    return `${format(hours)}:${format(minutes % 60)}:${format(seconds % 60)}.${milliseconds % 1000}`
  }

  static genericSend(ctx: CommandContext): (t: string) => Promise<void> {
    return async (t: string) => {
      await ctx.reply(Utils.embed(t))
    }
  }

  static genericSendIfError(ctx: CommandContext): (t: string) => Promise<void> {
    return async (t: string) => {
      await ctx.reply(Utils.embed(t), { ephemeral: true })
    }
  }
}
