import {command, Command, CommandContext, MessageChannel, Utils} from "@lib";

import {ApplicationCommandOptionType} from "discord.js";
import {Play as PlayFn} from "../functions";

@command({
    name: "piwo",
    description: "Plays the song of Jasiek Kiep",
    options: [
        {
            name: "next",
            description: "Whether to add the results to the top of the queue.",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ]
})
export default class Piwo extends Command {
    async exec(ctx: CommandContext, { next}: { next: boolean }) {
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
            query: "https://www.youtube.com/watch?v=hbsT9OOqvzw",
            next,
            requester: ctx.user.id,
            guild: ctx.guild,
        })
    }
}