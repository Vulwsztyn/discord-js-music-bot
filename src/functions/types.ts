import {Client, VoiceBasedChannel} from "discord.js";
import {MessageChannel} from "@lib";
import {SpotifyManager} from "@lavaclient/spotify";

type CommonParams = {
    vc: VoiceBasedChannel | null | undefined
    send: (text: string, ...rest: any[]) => Promise<any>
    sendIfError: (text: string, ...rest: any[]) => Promise<any>
    channel: MessageChannel
    client: Client
    guildId: string
}

export type JoinParams = CommonParams

export type PlayParams = CommonParams & {
    query: string,
    next?: boolean,
    requester?: string
}

export type SkipParams = CommonParams