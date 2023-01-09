import Readline from "readline";
import MainMenu from "./../../../mainMenu";
import Snake from "./..";
import { IMenuItem } from "./../dataInterfaces";

export class WinMenu {
	protected game: Snake;

	protected readonly DEFAULT_SELECT_INDEX: number = 0;

	protected readonly menuOptions: Array<IMenuItem> = [
		{ name: "Play again", callback: () => { this.game.start(); } },
		{ name: "Return main menu", callback: () => { MainMenu.instance.show(); } }
	];

	constructor(game: Snake) {
		this.game = game;
	}

	public show(): void {
		const readline: Readline.Interface = Readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		let currentSelectIndex: number = this.DEFAULT_SELECT_INDEX;
		const render: () => void = () => {
			process.stdout.cursorTo(0, 0);
			process.stdout.clearScreenDown();
			process.stdout.write("You win!\n");
			for (let i: number = 0; i < this.menuOptions.length; i++) {
				if (i === currentSelectIndex) {
					process.stdout.write(`\x1b[4m\x1b[36m${this.menuOptions[i].name}\x1b[0m\n`);
				} else {
					process.stdout.write(`${this.menuOptions[i].name}\n`);
				}
			}
		};
		const keypressListener: (input: string, e: { name: string }) => void = (input: string, e: { name: string }) => {
			switch (e.name) {
				case "w":
					if (currentSelectIndex > 0) {
						currentSelectIndex -= 1;
					}
					render();
					break;
				case "s":
					if (currentSelectIndex < this.menuOptions.length - 1) {
						currentSelectIndex += 1;
					}
					render();
					break;
				case "return":
					readline.close();
					process.stdin.off("keypress", keypressListener);
					this.menuOptions[currentSelectIndex].callback();
					break;
				default:
					render();
			}
		}

		process.stdin.on("keypress", keypressListener);
		render();
	}
} 