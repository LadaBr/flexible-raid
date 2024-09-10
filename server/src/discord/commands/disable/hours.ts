import {Subcommand} from "../../subcommand";
import {ConfigController} from "../../../app/controllers/configController";

export default function hours() {
    return new Subcommand().setName("hours")
        .setDescription('Disables event hours')
        .addStringOption(opt => opt.setName("hours")
            .setRequired(true)
            .setDescription("Hours separated by comma, e.g., 0,1,2,3,4,5,6,7,8")
        )
        .setExecute(async (interaction, client) => {
            const value = interaction.options.get('hours')?.value as string;
            if (!value || !interaction.guildId) return;
            const hours = value.split(",").map(v => Number(v.trim())).filter(v => !isNaN(v));
            await ConfigController.disableConfigHours(interaction.guildId, hours);
            const config = await ConfigController.get(interaction.guildId);
            await interaction.reply({content: `Currently disabled hours: ${config?.disabledHours?.join(",")}`, ephemeral: true });
        })
}