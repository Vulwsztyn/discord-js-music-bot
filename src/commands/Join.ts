import {
    command,
    Command,
    CommandContext,
    MessageChannel,
    Utils,
} from "@lib";
import {Join as JoinFn} from "../functions"

@command({ name: "join", description: "Joins the member's voice channel." })
export default class Join extends Command {
    async exec(ctx: CommandContext) {
        await JoinFn(
            ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            (vc) => ctx.client.music.createPlayer(vc.guild.id),
            ctx.channel,
            (t: string) => ctx.reply(Utils.embed(t), ),
            (t: string) => ctx.reply(Utils.embed(t), { ephemeral: true }),
        )
    }
}
