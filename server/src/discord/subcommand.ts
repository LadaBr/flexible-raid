import {CommandInteraction, SlashCommandSubcommandBuilder} from "discord.js";
import DiscordBot from "./bot";

export class Subcommand extends SlashCommandSubcommandBuilder {
    execute?: (interaction: CommandInteraction, client: DiscordBot) => Promise<void>;

    setExecute(cb: Subcommand["execute"]) {
        this.execute = cb;
        return this;
    }
}