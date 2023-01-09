import Readline from "readline";
import { gamelist } from "./games/gameList";

export default class MainMenu {
    protected static _instance: MainMenu;
    public static get instance(): MainMenu {
        if (!MainMenu._instance)
            MainMenu._instance = new MainMenu();
        return MainMenu._instance;
    }

    protected readline!: Readline.Interface;

    protected _currentSelectIndex: number = 0;
    protected get currentSelectIndex(): number {
        return this._currentSelectIndex;
    }
    protected set currentSelectIndex(value: number) {
        if (value < 0) {
            value = 0;
        } else if (value > this.menuOptions.length - 1) {
            value = this.menuOptions.length - 1;
        }
        this._currentSelectIndex = value;
        this.renderMenu();
    }

    protected menuOptions: Array<IMenuItem> = [
        ...gamelist.map<IMenuItem>(game => { return { name: game.name, callback: () => game.start() } }),
        { name: "Exit application", callback: () => process.exit() }
    ];

    public show(): void {
        this.listenKeyboardEvent();
        this.renderMenu();
    }

    protected listenKeyboardEvent(): void {
        const listener: (input: string, e: { name: string }) => void = (input: string, e: { name: string }) => {
            switch (e.name) {
                case "up":
                case "w":
                    this.currentSelectIndex -= 1;
                    break;
                case "down":
                case "s":
                    this.currentSelectIndex += 1;
                    break;
                case "return":
                    this.readline.close();
                    process.stdin.off("keypress", listener);
                    this.menuOptions[this.currentSelectIndex].callback();
                    break;
                default:
                    this.renderMenu();
            }
        }

        this.readline = Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        process.stdin.on("keypress", listener);
    }

    protected renderMenu(): void {
        console.clear();
        process.stdout.write("Which game do you want to play?\n");
        for (let i: number = 0; i < this.menuOptions.length; i++) {
            if (i === this.currentSelectIndex) {
                process.stdout.write(`\x1b[4m\x1b[36m${this.menuOptions[i].name}\x1b[0m\n`);
            } else {
                process.stdout.write(`${this.menuOptions[i].name}\n`);
            }
        }
    }
}

interface IMenuItem {
    name: string;
    callback: () => void;
}