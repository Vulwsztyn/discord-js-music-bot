import {
    command,
    Command,
    CommandContext,
    MessageChannel,
    Utils,
} from "@lib";
import {Join as JoinFn} from "../functions"

@command({name: "join", description: "Joins the member's voice channel."})
export default class Join extends Command {
    async exec(ctx: CommandContext) {
        await JoinFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string) => ctx.reply(Utils.embed(t),),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
        })
    }
}
