import {ApplicationCommandOptionType} from "discord.js";
import {SkipParams} from "./types";


export async function Skip({
                               vc,
                               sendIfError,
                                send,
                               client,
                               guild,
                           }: SkipParams) {
    if (!vc) {
        return sendIfError("Join a voice channel bozo")
    }

    /* check if a player already exists, if so check if the invoker is in our vc. */
    let player = client.music.players.get(guild!.id)
    if (player && player.channelId && player.channelId !== vc.id) {
        return sendIfError(`Join <#${player.channelId}> bozo`)
    }
    if (!player) {
        return sendIfError("I'm not playing anything bozo")
    }
    const current = player.queue.current;
    if (!current) {
        return sendIfError("I'm not playing anything bozo")
    }
    await player.queue.skip()
    await player.queue.start()
    await send(`Skipped ${current.title}`)
}
