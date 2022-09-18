import { Client, Collection, GatewayDispatchEvents, Snowflake } from "discord.js";
import { Node } from "lavaclient";

import { Command } from "./command/Command";

export class Bot extends Client {
    readonly music: Node;
    readonly commands: Collection<Snowflake, Command> = new Collection();

    constructor() {
        super({
            intents: ["Guilds", "GuildMessages", "GuildVoiceStates"],
        });

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
    }
}

declare module "discord.js" {
    interface Client {
        readonly music: Node
    }
}
