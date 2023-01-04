import Readline from "readline";
import MainMenu from "../../mainMenu";
import { Game } from "../game";


export default class OneATwoB extends Game {
	public get name(): string {
		return "1A2B";
	}

	protected readline: Readline.Interface;
	protected answer: string;
	protected guessCount: number;

	protected readonly ANSWER_LENGTH: number = 4;

	protected winMenuOptions: Array<IMenuItem> = [
		{ name: "Play again", callback: () => { this.start(); } },
		{ name: "Return main menu", callback: () => { MainMenu.instance.init(); } }
	];

	constructor() {
		super();
		this.readline = Readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		this.answer = "";
		this.guessCount = 0;
	}

	public start(): void {
		console.clear();
		this.answer = this.generateRandomAnswer();
		this.guessCount = 0;
		this.question();
	}

	protected generateRandomAnswer(): string {
		let result: string = "";
		for (let i: number = 0; i < this.ANSWER_LENGTH; i++) {
			let randomNumber: number = -1;
			while (randomNumber < 0 || result.includes(randomNumber.toString())) {
				randomNumber = Math.floor(Math.random() * 10);
			}
			result += randomNumber.toString();
		}
		return result;
	}

	protected question(): void {
		this.readline.question("Guess the answer:\n", guessAnswer => {
			if (guessAnswer.length !== 4 || guessAnswer.split("").some(str => isNaN(parseInt(str)))) {
				process.stdout.write("\x1b[31mFormat error\x1b[0m, Please enter four digits.\n\n");
				this.question();
				return;
			}
			let aCount: number = 0;
			let bCount: number = 0;
			for (let i: number = 0; i < this.answer.length; i++) {
				if (guessAnswer[i] === this.answer[i]) {
					aCount += 1;
				} else if (guessAnswer.includes(this.answer[i])) {
					bCount += 1;
				}
			}
			if (aCount === this.answer.length) {
				this.winGame();
			} else {
				this.guessCount += 1;
				process.stdout.write(`${aCount}A${bCount}B\n\n`);
				this.question();
			}
		});
	}

	protected winGame(): void {
		let currentSelectIndex: number = 0;
		const listener: (input: string, e: { name: string }) => void = (input: string, e: { name: string }) => {
			switch (e.name) {
				case "up":
				case "w":
					if (currentSelectIndex > 0) {
						currentSelectIndex -= 1;
					}
					this.renderWinMenu(currentSelectIndex);
					break;
				case "down":
				case "s":
					if (currentSelectIndex < this.winMenuOptions.length - 1) {
						currentSelectIndex += 1;
					}
					this.renderWinMenu(currentSelectIndex);
					break;
				case "return":
					process.stdin.off("keypress", listener);
					this.winMenuOptions[currentSelectIndex].callback();
					break;
				default:
					this.renderWinMenu(currentSelectIndex);
			}
		}
		process.stdin.on("keypress", listener);

		this.renderWinMenu(currentSelectIndex);
	}

	protected renderWinMenu(selectIndex: number): void {
		console.clear();
		process.stdout.write(`Congratulation! Answer is ${this.answer}, You guess ${this.guessCount} times!\n`);
		for (let i: number = 0; i < this.winMenuOptions.length; i++) {
			if (i === selectIndex) {
				process.stdout.write(`\x1b[4m\x1b[36m${this.winMenuOptions[i].name}\x1b[0m\n`);
			} else {
				process.stdout.write(`${this.winMenuOptions[i].name}\n`);
			}
		}
	}
}

interface IMenuItem {
	name: string;
	callback: () => void;
}