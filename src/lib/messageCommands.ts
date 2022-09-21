import {CommonParams} from "../functions/types";
import {Client, Message, TextChannel} from "discord.js";
import {Utils} from "./Utils";
import {
    Join as JoinFn,
    Leave,
    Nightcore, Pause,
    Ping,
    Play as PlayFn,
    Queue, Remove,
    Resume,
    Seek,
    Skip as SkipFn
} from "../functions";

export const createMessageCommands: (client: Client) => Record<string, any> = (client) => {
    const genericFn = (fn: (args: CommonParams) => Promise<void>) => async (data: any, textChannel: TextChannel, message: Message<true>) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
        const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
        await fn(
            {
                vc,
                client,
                channel: textChannel,
                send,
                sendIfError: send,
                guild
            }
        )
    }
    const playFn = (next: boolean, override?: string) => async (data: any, textChannel: TextChannel, message: Message<true>) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
        const send = (t: string, t2: string) => message.reply({embeds: [Utils.embed(`${t} ${t2}`)]})
        const query = override || message.content.split(" ").slice(1).join(" ")
        if (query === "") {
            await Resume(
                {
                    vc,
                    client,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guild
                }
            )
        } else {
            await PlayFn(
                {
                    vc,
                    client,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    query,
                    next,
                    guild
                }
            )
        }
    }

    const seekFn = (add: boolean, prefix: string = '') => async (data: any, textChannel: TextChannel, message: Message<true>) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
        const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
        await Seek(
            {
                vc,
                client,
                channel: textChannel,
                send,
                sendIfError: send,
                guild,
                position: prefix + (message.content.split(" ").slice(1).join(" ")),
                add
            }
        )
    }

    return {
        join: genericFn(JoinFn),
        seek: seekFn(false),
        forward: seekFn(true),
        back: seekFn(true, '-'),
        leave: genericFn(Leave),
        nightcore: genericFn(Nightcore),
        ping: genericFn(Ping),
        play: playFn(false),
        playnext: playFn(true),
        skip: genericFn(SkipFn),
        piwo: async (data: any, textChannel: TextChannel, message: Message<true>) => playFn(false, "https://www.youtube.com/watch?v=hbsT9OOqvzw")(data, textChannel, message),
        piwonext: async (data: any, textChannel: TextChannel, message: Message<true>) => playFn(true, "https://www.youtube.com/watch?v=hbsT9OOqvzw")(data, textChannel, message),
        queue: async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = client.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2: string) => message.reply({
                embeds: [Utils.embed({
                    description: t2,
                    title: t
                })]
            })
            await Queue(
                {
                    vc,
                    client,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guild
                }
            )
        },
        remove: async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = client.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2: string) => message.reply({embeds: [Utils.embed(`${t} ${t2}`)]})
            await Remove(
                {
                    vc,
                    client,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    index: parseInt(message.content.split(" ").slice(1).join(" ")),
                    guild
                }
            )
        },
        pause: genericFn(Pause),
        resume: genericFn(Resume),
    }
}