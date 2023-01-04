import { gamelist } from "./games/gameList";

export default class MainMenu {
    protected static _instance: MainMenu;
    public static get instance(): MainMenu {
        if (!MainMenu._instance)
            MainMenu._instance = new MainMenu();
        return MainMenu._instance;
    }

    protected _currentSelectIndex: number = 0;
    protected get currentSelectIndex(): number {
        return this._currentSelectIndex;
    }
    protected set currentSelectIndex(value: number) {
        if (value < 0) {
            value = 0;
        } else if (value > gamelist.length - 1) {
            value = gamelist.length - 1;
        }
        this._currentSelectIndex = value;
    }

    public init(): void {
        const listener: (input: string, e: { name: string }) => void = (input: string, e: { name: string }) => {
            switch (e.name) {
                case "up":
                case "w":
                    this.currentSelectIndex -= 1;
                    this.renderMenu();
                    break;
                case "down":
                case "s":
                    this.currentSelectIndex += 1;
                    this.renderMenu();
                    break;
                case "return":
                    process.stdin.off("keypress", listener);
                    this.enterGame();
                    break;
                default:
                    this.renderMenu();
            }
        }

        process.stdin.on("keypress", listener);

        this.renderMenu();
    }

    protected renderMenu(): void {
        console.clear();
        process.stdout.write("Which game do you want to play?\n");
        for (let i: number = 0; i < gamelist.length; i++) {
            if (i === this.currentSelectIndex) {
                process.stdout.write(`\x1b[4m\x1b[36m${gamelist[i].name}\x1b[0m` + "\n");
            } else {
                process.stdout.write(gamelist[i].name + "\n");
            }
        }
    }

    protected enterGame(): void {
        gamelist[this.currentSelectIndex].start();
    }
}