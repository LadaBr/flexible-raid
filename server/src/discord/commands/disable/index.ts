import {Command} from "../../command";
import hours from "./hours";

export default function disable() {
    return new Command()
        .setName('disable')
        .setDescription('Disables values')
        .addSubcommand(hours())
}