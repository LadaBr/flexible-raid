import {Command} from "../../command";
import add from "./add";

export default function requirements() {
    return new Command()
        .setName('requirements')
        .setDescription('Modify requirements for possible event')
        .addSubcommand(add())
}