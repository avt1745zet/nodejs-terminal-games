import MainMenu from "./src/mainMenu";

export default class Main {
	constructor() {
		MainMenu.instance.show();
	}
}

new Main();