import {command, Command, CommandContext, MessageChannel, Utils} from "@lib";
import {SpotifyItemType} from "@lavaclient/spotify";

import type {Addable} from "@lavaclient/queue";
import {ApplicationCommandOptionType, VoiceBasedChannel} from "discord.js";
import {PlayParams, SkipParams} from "./types";


export async function Skip({
                               vc,
                               sendIfError,
                                send,
                               client,
                               guildId,
                           }: SkipParams) {
    if (!vc) {
        return sendIfError("Join a voice channel bozo")
    }

    /* check if a player already exists, if so check if the invoker is in our vc. */
    let player = client.music.players.get(guildId)
    if (player && player.channelId !== vc.id) {
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
