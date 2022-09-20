import { command, Command, CommandContext, Utils } from "@lib";
import {ApplicationCommandOptionType} from "discord.js";
import {Remove as RemoveFn} from "../functions"

@command({ 
    name: "remove", 
    description: "Removes a track from the queue.",
    options: [
        {
            name: "index",
            description: "The index of the track to remove.",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
})
export default class Remove extends Command {
    async exec(ctx: CommandContext, { index }: { index: number }) {
        await RemoveFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string, str: string) => ctx.reply(Utils.embed({
                description: str,
                title: t
            })),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            guild: ctx.guild,
            index,
        })
    }
}