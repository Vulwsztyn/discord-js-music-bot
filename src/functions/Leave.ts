import {LeaveParams} from "./types";

export async function Leave({
                               vc,
                               sendIfError,
                               send,
                               client,
                               guild,
                           }: LeaveParams) {
    /* check if a player exists for this guild. */
    const player = client.music.players.get(guild!.id);
    if (!player?.connected) {
        return sendIfError("I couldn't find a player for this guild.")
    }

    /* check if the user is in the player's voice channel. */
    if (!vc || player.channelId !== vc.id) {
        return sendIfError("You're not in my voice channel, bozo.")
    }

    await send(`Left <#${player.channelId}>`)

    /* leave the player's voice channel. */
    player.disconnect();
    client.music.destroyPlayer(player.guildId);
}
