import {command, Command, CommandContext, Utils} from "@lib";

import {ApplicationCommandOptionType} from "discord.js";
import {Seek as SeekFn} from "../functions";

@command({
    name: "seek",
    description: "Seeks a position in current song",
    options: [
        {
            name: "position",
            description: "The position to seek to.",
            type: ApplicationCommandOptionType.String,
            required: true
        },
    ]
})
export default class Seek extends Command {
    async exec(ctx: CommandContext, {position}: { position: string }) {
        await SeekFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string) =>
                ctx.reply(Utils.embed({
                    description: t,
                }),),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            guild: ctx.guild,
            position,
            add: false
        })
    }
}