import {CommonParams, MessageCommandParams} from "../functions/types";
import {Client, TextChannel} from "discord.js";
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
    const genericFn = (fn: (args: CommonParams) => Promise<void>) => async ({
                                                                                data,
                                                                                textChannel,
                                                                                message,
                                                                            }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(data.author.id)?.channel

        const sendFn = async (a: any) => {
            try {
                await message?.reply(a)
            } catch (e) {
                await textChannel?.send(a)
            }
        }
        const send = (t: string) => sendFn({embeds: [Utils.embed(t)]})
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
    const playFn = (next: boolean, override?: string) => async ({
                                                                    data,
                                                                    textChannel,
                                                                    message,
                                                                }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(data.author.id)?.channel
        console.log({
                channel_id: data.channel_id,
                type: typeof (client.channels.cache.get(data.channel_id)),
                message,
            test: message ? 1 : 0,
            }
        )
        const sendFn = async (a: any) => {
            try {
                await message?.reply(a)
            } catch (e) {
                await textChannel?.send(a)
            }
        }
        const send = (t: string, t2: string) => sendFn({embeds: [Utils.embed(`${t} ${t2}`)]})
        const query = override || data.content.split(" ").slice(1).join(" ")
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

    const seekFn = (add: boolean, prefix: string = '') => async ({
                                                                     data,
                                                                     textChannel,
                                                                     message,
                                                                 }: MessageCommandParams) => {
        const guild = client.guilds.cache.get(data.guild_id)
        const vc = guild?.voiceStates.cache.get(data.author.id)?.channel
        const sendFn = async (a: any) => {
            try {
                await message?.reply(a)
            } catch (e) {
                await textChannel?.send(a)
            }
        }
        const send = (t: string) => sendFn({embeds: [Utils.embed(t)]})
        await Seek(
            {
                vc,
                client,
                channel: textChannel,
                send,
                sendIfError: send,
                guild,
                position: prefix + (data.content.split(" ").slice(1).join(" ")),
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
        piwo: async ({
                         data,
                         textChannel,
                         message,
                     }: MessageCommandParams) => playFn(false, "https://www.youtube.com/watch?v=hbsT9OOqvzw")({data, textChannel, message}),
        piwonext: async ({
                             data,
                             textChannel,
                             message,
                         }: MessageCommandParams) => playFn(true, "https://www.youtube.com/watch?v=hbsT9OOqvzw")({data, textChannel, message}),
        queue: async ({
                          data,
                          textChannel,
                          message,
                      }: MessageCommandParams) => {
            const guild = client.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(data.author.id)?.channel
            const sendFn = async (a: any) => {
                try {
                    await message?.reply(a)
                } catch (e) {
                    await textChannel?.send(a)
                }
            }
            const send = (t: string, t2: string) => sendFn({
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
        remove: async ({
                           data,
                           textChannel,
                           message,
                       }: MessageCommandParams) => {
            const guild = client.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(data.author.id)?.channel
            const sendFn = async (a: any) => {
                try {
                    await message?.reply(a)
                } catch (e) {
                    await textChannel?.send(a)
                }
            }
            const send = (t: string, t2: string) => sendFn({embeds: [Utils.embed(`${t} ${t2}`)]})
            await Remove(
                {
                    vc,
                    client,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    index: parseInt(data.content.split(" ").slice(1).join(" ")),
                    guild
                }
            )
        },
        pause: genericFn(Pause),
        resume: genericFn(Resume),
    }
}