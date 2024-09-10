import {Subcommand} from "../../subcommand";
import {ConfigController} from "../../../app/controllers/configController";

export default function edit(prepend?: (subcommand: Subcommand) => void) {
    const subcommand = new Subcommand();
    if (prepend) prepend(subcommand);
    return subcommand.setName("edit")
        .setDescription('Edit requirements for possible event')
        .addStringOption(opt => opt.setName("name").setDescription("Name of these requirements"))
        .addChannelOption(opt => opt.setName("channel").setDescription("Channel for the event").setRequired(false))
        .addStringOption(opt => opt.setName("color").setDescription("Color of the event").setRequired(false))
        .addStringOption(opt => opt.setName("image").setDescription("Image of the event").setRequired(false))
        .addRoleOption(opt => opt.setName("role1").setDescription("Discord role that can attend"))
        .addRoleOption(opt => opt.setName("role2").setDescription("Discord role that can attend"))
        .addRoleOption(opt => opt.setName("role3").setDescription("Discord role that can attend"))
        .addRoleOption(opt => opt.setName("role4").setDescription("Discord role that can attend"))
        .addNumberOption(opt => opt.setName("tanks").setDescription("Amount of tanks"))
        .addNumberOption(opt => opt.setName("healers").setDescription("Amount of healers"))
        .addNumberOption(opt => opt.setName("damage_dealers").setDescription("Amount of damage dealers"))
        .addNumberOption(opt => opt.setName("players").setDescription("Amount of players"))
        .setExecute(async (interaction, client) => {
            console.log("Added requirements with", interaction.options);
            const id = interaction.options.get("id")?.value as string;
            if (!interaction.guildId || !id) return;
            await ConfigController.updateRequirements(interaction.guildId, id, {
                minPlayers: interaction.options.get("players")?.value as number,
                name: interaction.options.get("name")?.value as string,
                roles: {
                    tanks: interaction.options.get("tanks")?.value as number,
                    healers: interaction.options.get("healers")?.value as number,
                    damageDealers: interaction.options.get("damage_dealers")?.value as number,
                },
                discordRoles: [
                    interaction.options.get("role1"),
                    interaction.options.get("role2"),
                    interaction.options.get("role3"),
                    interaction.options.get("role4"),
                ].map(v => v?.role?.id).filter(v => v).map(v => v as string),
                image: interaction.options.get("image")?.value as string,
                color: interaction.options.get("color")?.value as string,
                channelId:  interaction.options.get("channel")?.channel?.id as string,
            });
            await client.refreshCommands(interaction.guildId);
            await interaction.reply({content: "Edited requirements", ephemeral: true });
        })
}