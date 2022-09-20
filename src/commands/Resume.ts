import {
    command,
    Command,
    CommandContext,
    Utils,
} from "@lib";
import {Resume as ResumeFn} from "../functions"

@command({name: "resume", description: "Resumes the playback."})
export default class Resume extends Command {
    async exec(ctx: CommandContext) {
        await ResumeFn({
            vc: ctx.guild?.voiceStates?.cache?.get(ctx.user.id)?.channel,
            client: ctx.client,
            channel: ctx.channel,
            send: (t: string) => ctx.reply(Utils.embed(t),),
            sendIfError: (t: string) => ctx.reply(Utils.embed(t), {ephemeral: true}),
            guild: ctx.guild,
        })
    }
}
