import Discord, {CommandInteraction, GatewayIntentBits, Interaction, Partials} from 'discord.js';
import config, {discord} from '../assets/config.json';
import {ConfigController} from "../app/controllers/configController";
import {deployCommands} from "./deploy";
import commands from "./commands";
import {Command} from "./command";
import Commands from "./commands";
import edit from "./commands/requirements/edit";
import {Subcommand} from "./subcommand";
import remove from "./commands/requirements/remove";
import {RaidHelperApi} from "../app/api/raid-helper.api";

class DiscordBot {
    client = new Discord.Client(
        {
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        }
    );
    commands: Record<string, Record<string, Command>> = {};

    constructor() {
        this.client.on('ready', async () => {
            console.log(`Logged in as ${this.client.user?.tag}!`);
            const guilds = await this.client.guilds.fetch();
            guilds.forEach(guild => {
                this.createConfig(guild.id);
                this.refreshCommands(guild.id);
                console.log("Refreshing", guild.id);
            });
        });
        this.client.on('guildCreate', async (guild) => {
            console.log(`Joined new guild`, guild.id, guild.name);
            await this.createConfig(guild.id);
            await this.refreshCommands(guild.id);
        });
        this.client.on('messageDelete', async (message) => {
            if (message.author?.id === config["raid-helper"].id && message.author?.bot) {
                RaidHelperApi.clearCachedEvent(`${message.guildId}-${message.id}`);
            }
        });
        this.client.on('messageUpdate', async (message) => {
            if (message.author?.id === config["raid-helper"].id && message.author?.bot) {
                RaidHelperApi.clearCachedEvent(`${message.guildId}-${message.id}`);
            }
        });

        this.client.on('interactionCreate', async (interaction: Interaction) => {
            if (!interaction.isCommand() || !interaction.guildId) return;
            const interaction2 = interaction as CommandInteraction;
            console.log(interaction2.commandName, interaction2.options.data, this.commands);
            const mainCommand = this.commands[interaction.guildId][interaction.commandName];
            const subCommand = interaction2.options.data[0];
            const command = subCommand ? mainCommand.subcommands[subCommand.name] : mainCommand;
            console.log(command);
            if (!command || !command.execute) return;

            try {
                await command.execute(interaction, this);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }

    async deployCommands(guildId: string, commands: Record<string, Command>) {
        await deployCommands(guildId, commands);
        this.commands[guildId] = commands;
    }

    async createCommands(guildId: string) {
        const config = await ConfigController.get(guildId);
        const choices = config ? config.requirements.map(r => ({name: r.name, value: r._id!.toString()})) : [];
        const commands = Commands();
        commands.requirements.addSubcommand(
            edit((subcommand: Subcommand) => {
                subcommand.addStringOption(opt => opt.setName("id")
                    .setDescription("ID of requirements")
                    .addChoices(...choices)
                    .setRequired(true)
                )
            })
        );
        commands.requirements.addSubcommand(
            remove((subcommand: Subcommand) => {
                subcommand.addStringOption(opt => opt.setName("id")
                    .setDescription("ID of requirements")
                    .addChoices(...choices)
                    .setRequired(true)
                )
            })
        );
        return commands;
    }

    async createConfig(guildId: string) {
        const exists = await ConfigController.exists(guildId);
        if (!exists) {
            await ConfigController.create(guildId);
            console.log("Created config for", guildId);
        }
    }

    login() {
        return this.client.login(discord.bot.token);
    }

    async refreshCommands(guildId: string) {
        const commands = await this.createCommands(guildId);
        this.deployCommands(guildId, commands);
    }

    async fetchMember(guildId: string, userId: string) {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.members.fetch(userId);
    }

    async hasRole(guildId: string, userId: string, ...roleNameOrId: string[]) {
        const member = await this.fetchMember(guildId, userId);
        return member.roles.cache.some(r => !!roleNameOrId.find(t => t === r.name || t === r.id));
    }
}

export default DiscordBot;