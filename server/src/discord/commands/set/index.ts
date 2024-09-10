import {Command} from "../../command";
import manager from "./manager";
import attend from "./attend";

export default function set() {
    return new Command()
        .setName('set')
        .setDescription('Sets values')
        .addSubcommand(manager())
        .addSubcommand(attend())
}