import 'dotenv/config'
import 'module-alias/register'
import {load} from '@lavaclient/spotify'
import {Bot, CommandContext, embedFn, syncCommands} from '@lib'
import {join} from 'path'
import {type CacheType, type Interaction} from 'discord.js'
import logger from './lib/Logger'
import {Queue, Song} from "@lavaclient/queue"
import axios from "axios"
import {z} from "zod"
import * as process from "process";

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

    await queue.channel.send({embeds: [embed]})
    queue.player.disconnect()
    await queue.player.node.destroyPlayer(queue.player.guildId)
})
const chunkTextAndTranslation = (text: string, translation: string) => {
    const chunks: { text: string, translation: string }[] = []
    let textChunk = ''
    let translationChunk = ''
    const splitText = text.split('\n')
    const splitTranslation = translation.split('\n')
    const maxLength = 956
    const maxLineLength = 41
    for (let i = 0; i < splitText.length; i++) {
        const textLength = (splitText[i]?.length ?? 0)
        const translationLength = (splitTranslation[i]?.length ?? 0)
        if (textChunk.length + textLength > maxLength || translationChunk.length + translationLength > maxLength) {
            chunks.push({
                text: textChunk,
                translation: translationChunk
            })
            textChunk = ''
            translationChunk = ''
        }
        textChunk += (splitText[i] ?? '') + '\n'
        translationChunk += (splitTranslation[i] ?? '') + '\n'
        while (textChunk.length > maxLength || translationChunk.length > maxLength) {
            chunks.push({
                text: textChunk.slice(0, maxLength),
                translation: translationChunk.slice(0, maxLength)
            })
            textChunk = textChunk.slice(maxLength)
            translationChunk = translationChunk.slice(maxLength)
        }
        if (textLength > maxLineLength) {
            translationChunk += '\n'
        }
        if (translationLength > maxLineLength) {
            textChunk += '\n'
        }
    }
    if (textChunk.length > 0 || translationChunk.length > 0) {
        chunks.push({
            text: textChunk,
            translation: translationChunk
        })
    }
    return chunks
}
const getLyrics = async (queue: Queue, song: Song) => {
    const {author, title} = song
    const link = `${process.env.LYRICS_API_HOST}/?artist=${author}&title=${title}`
    const response = await axios.get(link).catch((e) => {
        logger.info(e)
    })
    if (!response || response.status !== 200) {
        return
    }
    const schema = z.object({
        text: z.string(),
        translation: z.string(),
    })
    const data = schema.safeParse(response.data)
    if (data.success) {
        logger.debug(data.data)
        const chunks = chunkTextAndTranslation(data.data.text, data.data.translation)
        for (const chunk of chunks) {
            const embed = embedFn(
                'Lyrics'
            ).addFields(
                [
                    {name: 'Original', value: chunk.text, inline: true},
                    {name: 'Translation', value: chunk.translation, inline: true}
                ]
            )
            await queue.channel.send({embeds: [embed]})
        }
    }
}

client.music.on('trackStart', async (queue: Queue, song: Song) => {
    const embed = embedFn(
        `Now playing [**${song.title}**](${song.uri}) ${song.requester != null ? `<@${song.requester}>` : ''}`
    )
    logger.debug(JSON.stringify(song, null, 2))

    await queue.channel.send({embeds: [embed]})
    await getLyrics(queue, song)
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
                return {[i.name]: value}
            })
        )

        await client.commands.get(interaction.commandId)?.exec(new CommandContext(interaction), options)
    }
})
