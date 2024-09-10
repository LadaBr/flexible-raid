import {discord} from '../assets/config.json';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v10';
import {Command} from "./command";

export function deployCommands(guildId: string, commands: Record<string, Command>) {
    const rest = new REST({version: discord.version.toString()}).setToken(discord.bot.token);

    return rest.put(Routes.applicationGuildCommands(discord.client_id, guildId), {
        body: Object.values(commands).map(c => {
            return c.toJSON();
        })
    })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
