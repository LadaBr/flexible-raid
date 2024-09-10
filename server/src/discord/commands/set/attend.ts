import {Subcommand} from "../../subcommand";
import {ConfigController} from "../../../app/controllers/configController";

export default function attend() {
    return new Subcommand().setName("roles")
        .setDescription('Set the attendance roles. These roles can join events.')
        .addRoleOption(opt => opt.setName("role1").setRequired(true).setDescription("Attendance role"))
        .addRoleOption(opt => opt.setName("role2").setRequired(false).setDescription("Attendance role"))
        .addRoleOption(opt => opt.setName("role3").setRequired(false).setDescription("Attendance role"))
        .addRoleOption(opt => opt.setName("role4").setRequired(false).setDescription("Attendance role"))
        .setExecute(async (interaction, client) => {
            if (!interaction.guildId) return;
            const config = await ConfigController.get(interaction.guildId);
            if (!config) return;
            config.attendRoles = [
                interaction.options.get("role1"),
                interaction.options.get("role2"),
                interaction.options.get("role3"),
                interaction.options.get("role4"),
            ].map(v => v?.role?.id).filter(v => v).map(v => v as string);
            await config.save();
            await interaction.reply({content: `Successfully set ${config.attendRoles.map(role => `<@&${role}>`).join(", ")} as attendance role(s)`, ephemeral: true });
        })
}