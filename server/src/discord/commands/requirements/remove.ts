import {Subcommand} from "../../subcommand";
import {ConfigController} from "../../../app/controllers/configController";
import {deployCommands} from "../../deploy";

export default function remove(prepend?: (subcommand: Subcommand) => void) {
    const subcommand = new Subcommand();
    if (prepend) prepend(subcommand);
    return subcommand.setName("remove")
        .setDescription('Remove requirements of possible event')
        .setExecute(async (interaction, client) => {
            console.log("Removed requirements with", interaction.options);
            if (!interaction.guildId) return;
            await ConfigController.removeRequirements(interaction.guildId, interaction.options.get("id")?.value as string);
            console.log(1);
            await client.refreshCommands(interaction.guildId);
            console.log(2);
            await interaction.reply({content: "Removed requirements", ephemeral: true });
            console.log(3);
        })
}