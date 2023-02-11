import 'dotenv/config'
import 'module-alias/register'
import { load } from '@lavaclient/spotify'
import { Bot, CommandContext, embedFn, syncCommands } from '@lib'
import { join } from 'path'
import { type CacheType, type Interaction } from 'discord.js'

load({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID ?? '',
    secret: process.env.SPOTIFY_CLIENT_SECRET ?? ''
  },
  autoResolveYoutubeTracks: true
})

const client = new Bot()

client.music.on('connect', () => {
  console.log('[music] now connected to lavalink')
})

client.music.on('queueFinish', async (queue) => {
  const embed = embedFn('Uh oh, the queue has ended :/')

  await queue.channel.send({ embeds: [embed] })
  queue.player.disconnect()
  await queue.player.node.destroyPlayer(queue.player.guildId)
})

client.music.on('trackStart', async (queue, song) => {
  const embed = embedFn(
    `Now playing [**${song.title}**](${song.uri}) ${song.requester != null ? `<@${song.requester}>` : ''}`
  )
  await queue.channel.send({ embeds: [embed] })
})

client.on('ready', async () => {
  await syncCommands(client, join(__dirname, 'commands'), !process.argv.includes('--force-sync'))
  if (client.user == null) return
  client.music.connect(client.user.id) // Client#user shouldn't be null on ready
  console.log('[discord] ready!')
})

client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    const options = Object.assign(
      {},
      ...interaction.options.data.map((i) => {
        const value = i.role ?? i.channel ?? i.member ?? i.user ?? i.value
        return { [i.name]: value }
      })
    )

    await client.commands.get(interaction.commandId)?.exec(new CommandContext(interaction), options)
  }
})
