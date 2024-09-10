import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {Subcommand} from "./subcommand";
import DiscordBot from "./bot";

export class Command extends SlashCommandBuilder {
    subcommands: Record<string, Subcommand> = {};
    execute?: (interaction: CommandInteraction, client: DiscordBot) => Promise<void>;

    addSubcommand(subcommand: Subcommand) {
        this.subcommands[subcommand.name] = subcommand;
        super.addSubcommand(subcommand);
        return this;
    }

    setExecute(cb: Command["execute"]) {
        this.execute = cb;
        return this;
    }
}