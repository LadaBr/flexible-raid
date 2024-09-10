import requirements from "./requirements";
import set from "./set";
import disable from "./disable";
import enable from "./enable";

export default function commands() {
    return {
        requirements: requirements(),
        set: set(),
        disable: disable(),
        enable: enable(),
    }
};