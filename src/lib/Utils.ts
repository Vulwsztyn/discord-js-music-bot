import { EmbedBuilder, type EmbedData, type NewsChannel, type TextChannel, type ThreadChannel } from 'discord.js'
import { lstatSync, readdirSync } from 'fs'
import { join } from 'path'

import type { Command, CommandContext } from '@lib'
import type { Bot } from './Bot'

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel

export const PRIMARY_COLOR = 0xfff269
export function embedFn(embed: EmbedData | string): EmbedBuilder {
  const options: EmbedData = typeof embed === 'string' ? { description: embed } : embed
  options.color ??= PRIMARY_COLOR

  return new EmbedBuilder(options)
}
export function embedded(embed: EmbedData | string): { embeds: EmbedBuilder[] } {
  return { embeds: [embedFn(embed)] }
}

export function walk(directory: string): string[] {
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

export async function syncCommands(client: Bot, dir: string, soft = false): Promise<void> {
  const commands: Command[] = []
  for (const path of walk(dir)) {
    const { default: Command } = await import(path)
    if (Command == null) {
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

export function stringToMilliseconds(str: string): number {
  const [secondsWithMicro, minutesStr, hoursStr] = str.split(':').reverse()
  const [secondsStr, microsecondsStr] = secondsWithMicro.split('.')
  const hours = hoursStr != null ? parseInt(hoursStr) : 0
  const minutes = minutesStr != null ? parseInt(minutesStr) : 0
  const seconds = secondsStr != null ? parseInt(secondsStr) : 0
  const milliseconds = microsecondsStr != null ? parseInt(microsecondsStr.padEnd(4, '0')) : 0
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds
}

export function millisecondsToString(milliseconds: number): string {
  const seconds = milliseconds / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const format = (num: number): string => Math.floor(num).toString().padStart(2, '0')
  return `${format(hours)}:${format(minutes % 60)}:${format(seconds % 60)}.${milliseconds % 1000}`
}

export function genericSend(ctx: CommandContext): (t: string) => Promise<void> {
  return async (t: string) => {
    await ctx.reply(embedFn(t))
  }
}

export function genericSendIfError(ctx: CommandContext): (t: string) => Promise<void> {
  return async (t: string) => {
    await ctx.reply(embedFn(t), { ephemeral: true })
  }
}
