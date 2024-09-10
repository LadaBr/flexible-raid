import {Subcommand} from "../../subcommand";
import {ConfigController} from "../../../app/controllers/configController";

export default function manager() {
    return new Subcommand().setName("manager")
        .setDescription('Set the manager role. Managers can create events.')
        .addRoleOption(opt => opt.setName("role")
            .setRequired(true)
            .setDescription("Manager role")
        )
        .setExecute(async (interaction, client) => {
            const role = interaction.options.get('role')?.role;
            if (!role || !interaction.guildId) return;
            const config = await ConfigController.get(interaction.guildId);
            if (!config) return;
            config.managerRole = role.id;
            await config.save();
            await interaction.reply({content: `Successfully set <@&${role?.id}> as manager role`, ephemeral: true });
        })
}