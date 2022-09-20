import {command, Command, CommandContext, MessageChannel, Utils} from "@lib";
import {SpotifyItemType} from "@lavaclient/spotify";

import type {Addable} from "@lavaclient/queue";
import {ApplicationCommandOptionType, VoiceBasedChannel} from "discord.js";
import {SeekParams} from "./types";


export async function Seek({
                               vc,
                               sendIfError,
                               send,
                               client,
                               guildId,
                               position,
                           }: SeekParams) {
    if (!vc) {
        return sendIfError("Join a voice channel bozo")
    }
    const positionNumerised = Number(position)
    if (isNaN(positionNumerised)) {
        return sendIfError("Position must be a number")
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
    await player.seek(positionNumerised)
    await send(`Sought ${current.title} to ${position}`)
}
