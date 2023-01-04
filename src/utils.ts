export default class Utils {
	public static async waitForSecond(sec: number): Promise<void> {
		await new Promise<void>(resolve => {
			setTimeout(() => {
				resolve();
			}, sec * 1000);
		});
	}
}