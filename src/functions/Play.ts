import {SpotifyItemType} from "@lavaclient/spotify";

import type {Addable} from "@lavaclient/queue";
import {ApplicationCommandOptionType} from "discord.js";
import {PlayParams} from "./types";


export async function Play({
                               vc,
                               send,
                               sendIfError,
                               channel,
                               client,
                               query,
                               next,
                               requester,
                               guild
                           }: PlayParams) {
    if (!vc) {
        return sendIfError("Join a voice channel bozo")
    }

    /* check if a player already exists, if so check if the invoker is in our vc. */
    let player = client.music.players.get(guild!.id)
    if (player && player.channelId !== vc.id) {
        return sendIfError(`Join <#${player.channelId}> bozo`)
    }

    let tracks: Addable[] = [], msg: string = "";
    if (query != '') {
        if (client.music.spotify.isSpotifyUrl(query)) {
            const item = await client.music.spotify.load(query);
            switch (item?.type) {
                case SpotifyItemType.Track:
                    const track = await item.resolveYoutubeTrack();
                    tracks = [track];
                    msg = `Queued track [**${item.name}**](${query}).`;
                    break;
                case SpotifyItemType.Artist:
                    tracks = await item.resolveYoutubeTracks();
                    msg = `Queued the **Top ${tracks.length} tracks** for [**${item.name}**](${query}).`;
                    break;
                case SpotifyItemType.Album:
                case SpotifyItemType.Playlist:
                    tracks = await item.resolveYoutubeTracks();
                    msg = `Queued **${tracks.length} tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${item.name}**](${query}).`;
                    break;
                default:
                    return sendIfError("Sorry, couldn't find anything :/")
            }
        } else {
            const results = await client.music.rest.loadTracks(/^https?:\/\//.test(query)
                ? query
                : `ytsearch:${query}`);

            switch (results.loadType) {
                case "LOAD_FAILED":
                case "NO_MATCHES":
                    return sendIfError("uh oh something went wrong")
                case "PLAYLIST_LOADED":
                    tracks = results.tracks;
                    msg = `Queued playlist [**${results.playlistInfo.name}**](${query}), it has a total of **${tracks.length}** tracks.`;
                    break
                case "TRACK_LOADED":
                case "SEARCH_RESULT":
                    const [track] = results.tracks;
                    tracks = [track];
                    msg = `Queued [**${track.info.title}**](${track.info.uri})`;
                    break;
            }
        }
    }
    /* create a player and/or join the member's vc. */
    if (!player?.connected) {
        player ??= client.music.createPlayer(guild!.id);
        player.queue.channel = channel
        await player.connect(vc.id, {deafened: true});
    }

    /* reply with the queued message. */
    const started = player.playing || player.paused;
    if (msg !== '') { //TODO: make it better (this checks if play was used to unpause)
        await send(msg, next ? "At the top of the queue." : "", started)
        player.queue.add(tracks, {requester, next});
        await player.queue.start()
    } else {
        await send("Resumed playback")
        await player.queue.start()
    }
    /* do queue tings. */
    await player.pause(false)
}
