import {Command} from "../../command";
import hours from "./hours";

export default function enable() {
    return new Command()
        .setName('enable')
        .setDescription('Enable values')
        .addSubcommand(hours())
}