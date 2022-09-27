import {Channel, Client, Collection, GatewayDispatchEvents, Message, Snowflake, TextChannel} from "discord.js";
import {Node} from "lavaclient";

import {Command} from "./command/Command";
import {aliases} from "./aliases";
import {createMessageCommands} from "./messageCommands";
import {MessageCommandParams} from "../functions/types";

export class Bot extends Client {
    readonly music: Node;
    readonly commands: Collection<Snowflake, Command> = new Collection();

    readonly messageCommands: Record<string, (params: MessageCommandParams) => Promise<null>> = {}
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
        this.ws.on(GatewayDispatchEvents.MessageCreate, this.handleMessage.bind(this))
        this.ws.on(GatewayDispatchEvents.MessageUpdate, this.handleMessage.bind(this))
    }

    async getMessage(channel: TextChannel, id: string): Promise<Message<true> | null> {
        try {
            return await channel.messages.fetch(id)
        } catch (e) {
            return null
        }
    }

    async handleMessage(data: any) {
        if (!data.author || data.author.id === this.user?.id) return;
        const textChannel = this.channels.cache.get(data.channel_id) as TextChannel
        const message = await this.getMessage(textChannel, data.id)
        if (data.content.startsWith(this.prefix)) {
            const commandOrAlias = data.content.split(" ")[0].slice(this.prefix.length)
            const command = commandOrAlias in this.messageCommandsAliases ? this.messageCommandsAliases[commandOrAlias] : commandOrAlias
            if (command in this.messageCommands) {
                await this.messageCommands[command]({data, textChannel, message})
            }
        }
    }

    attachMessageCommands() {
        const messageCommands = createMessageCommands(this)
        Object.keys(messageCommands).forEach(command => {
            this.messageCommands[command] = messageCommands[command]
        })
    }

    attachMessageCommandsAliases() {
        Object.keys(aliases).forEach(alias => {
            this.messageCommandsAliases[alias] = aliases[alias]
        })
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