import {command, Command, CommandContext, MessageChannel, Utils} from "@lib";
import {SpotifyItemType} from "@lavaclient/spotify";

import type {Addable} from "@lavaclient/queue";
import {ApplicationCommandOptionType} from "discord.js";
import {Play as PlayFn} from "../functions";

@command({
    name: "play",
    description: "Plays a song in the current vc.",
    options: [
        {
            name: "query",
            description: "The search query.",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "next",
            description: "Whether to add the results to the top of the queue.",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ]
})
export default class Play extends Command {
    async exec(ctx: CommandContext, {query, next}: { query: string, next: boolean }) {
        await PlayFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string, t2?: string, started?: boolean) =>
                ctx.reply(Utils.embed({
                    description: t,
                    footer: t2 ? {text: t2} : undefined
                }), {ephemeral: !started}),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            query,
            next,
            requester: ctx.user.id,
            guildId: ctx.guild!.id
        })
    }
}