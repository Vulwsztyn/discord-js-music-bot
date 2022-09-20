import {Channel, Client, Collection, GatewayDispatchEvents, Message, Snowflake, TextChannel} from "discord.js";
import {Node} from "lavaclient";

import {Command} from "./command/Command";
import {Utils} from "./Utils";
import {Join as JoinFn, Play as PlayFn, Skip as SkipFn} from "../functions"

export class Bot extends Client {
    readonly music: Node;
    readonly commands: Collection<Snowflake, Command> = new Collection();

    readonly messageCommands: Record<string, any> = {}
    readonly prefix = process.env.PREFIX || "!"

    constructor() {
        super({
            intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "MessageContent"],
        });

        this.attachMessageCommands()
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
        console.log(JSON.stringify({
            ...data,
            myType: "create",
            prefixed: message.content.startsWith(this.prefix)
        }, null, 2))
        if (message.content.startsWith(this.prefix)) {
            const command = message.content.split(" ")[0].slice(this.prefix.length)
            if (command in this.messageCommands) {
                await this.messageCommands[command](data, channel, message)
            }
        }
    }

    attachMessageCommands() {
        this.messageCommands["join"] = async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const vc = this.guilds.cache.get(data.guild_id)?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
            await JoinFn(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guildId: data.guild_id
                }
            )
        }

        const playFn = (next: boolean) => async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const vc = this.guilds.cache.get(data.guild_id)?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string, t2:string) => message.reply({embeds: [Utils.embed(`${t} ${t2}`)]})
            await PlayFn(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    query: message.content.split(" ").slice(1).join(" "),
                    next,
                    guildId: data.guild_id
                }
            )
        }

        this.messageCommands["play"] = playFn(false)
        this.messageCommands["playnext"] = playFn(true)

        this.messageCommands["skip"] = async (data: any, textChannel: TextChannel, message: Message<true>) => {
            const vc = this.guilds.cache.get(data.guild_id)?.voiceStates.cache.get(message.author.id)?.channel
            const send = (t: string) => message.reply({embeds: [Utils.embed(t)]})
            await SkipFn(
                {
                    vc,
                    client: this,
                    channel: textChannel,
                    send,
                    sendIfError: send,
                    guildId: data.guild_id
                }
            )
        }
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