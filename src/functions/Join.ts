
import { VoiceBasedChannel} from "discord.js";
import {MessageChannel} from "@lib";

export async function Join (vc: VoiceBasedChannel | null | undefined, createPlayer: (vc:any) => any, channel: MessageChannel, send: (text: string) => Promise<any>, sendIfError: (text: string) => Promise<any>) {
    if (!vc) {
        return sendIfError("Join a vc, bozo.")
    }

    /* check if a player already exists for this guild. */
    const player = createPlayer(vc);
    if (player.connected) {
        return sendIfError("I'm already connected to a vc.");
    }

    /* set the queue channel so that we can send track start embeds. */
    player.queue.channel = channel

    /* connect to the vc. */
    await player.connect(vc.id);

    await send(`Joined ${vc}`)
}
