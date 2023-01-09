import MainMenu from "./src/mainMenu";

export default class Main {
	constructor() {
        process.stdout.cursorTo(0, 0)
        process.stdout.clearScreenDown();
		MainMenu.instance.show();
	}
}

new Main();