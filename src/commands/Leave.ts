import { command, Command, CommandContext, Utils } from "@lib";
import {Leave as LeaveFn} from "../functions"

@command({ name: "leave", description: "Leaves the VC that the bot is currently in." })
export default class Leave extends Command {
    async exec(ctx: CommandContext) {
        await LeaveFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string) => ctx.reply(Utils.embed(t),),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            guild: ctx.guild,
        })
    }
}
