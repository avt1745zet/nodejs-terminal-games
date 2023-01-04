import MainMenu from "./src/mainMenu";

export default class Main {
	constructor() {
		MainMenu.instance.init();
	}
}

new Main();