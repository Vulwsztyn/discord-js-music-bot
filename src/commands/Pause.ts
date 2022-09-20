import {
    command,
    Command,
    CommandContext,
    Utils,
} from "@lib";
import {Pause as PauseFn} from "../functions"

@command({name: "pause", description: "Pauses the playback."})
export default class Pause extends Command {
    async exec(ctx: CommandContext) {
        await PauseFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string) => ctx.reply(Utils.embed(t),),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            guild: ctx.guild,
        })
    }
}
