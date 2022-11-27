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
                               guild,
                               position,
                                add
                           }: SeekParams) {
    if (!vc) {
        return sendIfError("Join a voice channel bozo")
    }

    /* check if a player already exists, if so check if the invoker is in our vc. */
    let player = client.music.players.get(guild!.id)
    if (player && player.channelId && player.channelId !== vc.id) {
        return sendIfError(`Join <#${player.channelId}> bozo`)
    }
    if (!player) {
        return sendIfError("I'm not playing anything bozo (no player)")
    }
    const current = player.queue.current;
    if (!current) {
        return sendIfError("I'm not playing anything bozo (no current song)")
    }
    const positionNumerised = (add ? player.position || 0 : 0)  + Utils.stringToMilliseconds(position);
    if (isNaN(positionNumerised)) {
        return sendIfError("Position must be a number")
    }
    await player.seek(positionNumerised)
    await send(`Sought ${current.title} to ${positionNumerised}`)
}
