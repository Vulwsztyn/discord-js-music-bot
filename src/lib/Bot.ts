import {Channel, Client, Collection, GatewayDispatchEvents, Message, Snowflake, TextChannel} from "discord.js";
import {Node} from "lavaclient";

import {Command} from "./command/Command";
import {Utils} from "./Utils";
import {
    Join as JoinFn,
    Play as PlayFn,
    Skip as SkipFn,
    Seek,
    Leave,
    Nightcore,
    Ping,
    Queue,
    Remove,
    Resume,
    Pause
} from "../functions"
import {CommonParams} from "../functions/types";

export class Bot extends Client {
    readonly music: Node;
    readonly commands: Collection<Snowflake, Command> = new Collection();

    readonly messageCommands: Record<string, any> = {}
    readonly messageCommandsAliases: Record<string, string> = {}
    readonly prefix = process.env.PREFIX || "!"

    constructor() {
        super({
            intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "MessageContent"],
        });

        this.attachMessageCommands()
        this.attachMessageCommandsAliases()
        this.music = new Node({
            sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
            connection: {
                host: process.env.LAVA_HOST!,
                password: process.env.LAVA_PASS!,
                port: 2333
            }
        });

        this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, data => this.music.handleVoiceUpdate(data));
        this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, data => this.music.handleVoiceUpdate(data));
        this.ws.on(GatewayDispatchEvents.MessageCreate, async (data) => {
            if (data.author.id === this.user?.id) return;
            await this.handleMessage(data)

        });
        this.ws.on(GatewayDispatchEvents.MessageUpdate, data => console.log(JSON.stringify({
            ...data,
            myType: "update"
        }, null, 2)));
    }

    async handleMessage(data: any) {
        const channel = this.channels.cache.get(data.channel_id) as TextChannel
        const message = await channel.messages.fetch(data.id)
        // console.log(JSON.stringify({
        //     ...data,
        //     myType: "create",
        //     prefixed: message.content.startsWith(this.prefix)
        // }, null, 2))
        if (message.content.startsWith(this.prefix)) {
            const commandOrAlias = message.content.split(" ")[0].slice(this.prefix.length)
            const command = commandOrAlias in this.messageCommandsAliases ? this.messageCommandsAliases[commandOrAlias] : commandOrAlias
            if (command in this.messageCommands) {
                await this.messageCommands[command](data, channel, message)
            }
        }
    }

    attachMessageCommands() {
        const genericFn = (fn: (args: CommonParams) => Promise<void>) => async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = this.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
            await fn(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guild
                }
            )
        }
        this.messageCommands["join"] = genericFn(JoinFn)

        const playFn = (next: boolean, override?: string) => async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = this.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2: string) => message.reply({embeds: [Utils.embed(`${t} ${t2}`)]})
            const query = override || message.content.split(" ").slice(1).join(" ")
            if (query === "") {
                await Resume(
                    {
                        vc,
                        client: this,
                        channel: textChannel,
                        send,
                        sendIfError: send,
                        guild
                    }
                )
            } else {
                await PlayFn(
                    {
                        vc,
                        client: this,
                        channel: textChannel,
                        send,
                        sendIfError: send,
                        query,
                        next,
                        guild
                    }
                )
            }
        }

        this.messageCommands["play"] = playFn(false)
        this.messageCommands["playnext"] = playFn(true)

        this.messageCommands["skip"] = genericFn(SkipFn)
        const seekFn = (add: boolean, prefix: string = '') => async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = this.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
            await Seek(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guild,
                    position: prefix + (message.content.split(" ").slice(1).join(" ")),
                    add
                }
            )
        }
        this.messageCommands["seek"] = seekFn(false)
        this.messageCommands["forward"] = seekFn(true)
        this.messageCommands["back"] = seekFn(true, '-')
        this.messageCommands["leave"] = genericFn(Leave)
        this.messageCommands["nightcore"] = genericFn(Nightcore)
        this.messageCommands["ping"] = genericFn(Ping)
        this.messageCommands["piwo"] = async (data: any, textChannel: TextChannel, _message: Message<true>) => playFn(false, "https://www.youtube.com/watch?v=hbsT9OOqvzw")(data, textChannel, _message)
        this.messageCommands["piwonext"] = async (data: any, textChannel: TextChannel, _message: Message<true>) => playFn(true, "https://www.youtube.com/watch?v=hbsT9OOqvzw")(data, textChannel, _message)
        this.messageCommands["queue"] = this.messageCommands["remove"] = async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = this.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2: string) => message.reply({
                embeds: [Utils.embed({
                    description: t2,
                    title: t
                })]
            })
            await Queue(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guild
                }
            )
        }
        this.messageCommands["remove"] = async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const guild = this.guilds.cache.get(data.guild_id)
            const vc = guild?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2: string) => message.reply({embeds: [Utils.embed(`${t} ${t2}`)]})
            await Remove(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    index: parseInt(message.content.split(" ").slice(1).join(" ")),
                    guild
                }
            )
        }
        this.messageCommands["pause"] = genericFn(Pause)
        this.messageCommands["resume"] = genericFn(Resume)
    }

    attachMessageCommandsAliases() {
        this.messageCommandsAliases['q'] = "queue"
        this.messageCommandsAliases['p'] = "play"
        this.messageCommandsAliases['pn'] = "playnext"
        this.messageCommandsAliases['s'] = "skip"
        this.messageCommandsAliases['q'] = "queue"
        this.messageCommandsAliases['r'] = "remove"
        this.messageCommandsAliases['rm'] = "remove"
    }

}

declare module "discord.js" {
    interface Client {
        readonly music: Node
    }
}


//{
//   "type": 0,
//   "tts": false,
//   "timestamp": "2022-09-19T19:52:37.877000+00:00",
//   "referenced_message": null,
//   "pinned": false,
//   "mentions": [],
//   "mention_roles": [],
//   "mention_everyone": false,
//   "member": {
//     "roles": [
//       "330377074164629505",
//       "859041954389688353",
//       "701780237876199474",
//       "782622700085706802",
//       "859041471464996884"
//     ],
//     "premium_since": null,
//     "pending": false,
//     "nick": "Pogchamp Babci",
//     "mute": false,
//     "joined_at": "2021-11-29T20:15:28.933000+00:00",
//     "flags": 0,
//     "deaf": false,
//     "communication_disabled_until": null,
//     "avatar": null
//   },
//   "id": "1021509140750807070",
//   "flags": 0,
//   "embeds": [],
//   "edited_timestamp": null,
//   "content": "huj",
//   "components": [],
//   "channel_id": "701391884353929282",
//   "author": {
//     "username": "Rythm3",
//     "public_flags": 0,
//     "id": "914967978385223700",
//     "discriminator": "8753",
//     "bot": true,
//     "avatar_decoration": null,
//     "avatar": "19afe6c192435cc0039fe44cfa1d2ea0"
//   },
//   "attachments": [],
//   "guild_id": "320835536883548161",
// }