import ReadLine from "readline";
import Utils from "./../../utils";
import { Game } from "./../game";
import { LoseMenu } from "./components/loseMenu";
import { WinMenu } from "./components/winMenu";
import { BlockType, Direction } from "./dataInterfaces";

export default class Snake extends Game {
	public get name(): string {
		return "Snake";
	}

	protected readline!: ReadLine.Interface;

	protected grid: Array<Array<BlockType>>;

	protected readonly GRID_WIDTH: number = 7;
	protected readonly GRID_HEIGHT: number = 7;
	protected readonly UPDATE_INTERVAL: number = 0.1;

	protected snake: Array<Array<number>>;
	protected snakeSpeed: number; // If 1, move 1 grid per second; If 2, move 2 grid per second.
	protected lastSnakeMoveTime: number;

	protected readonly DEFAULT_SNAKE_SPEED: number = 5;
	protected readonly DEFAULT_SNAKE_DIRECTION: number = Direction.Right;
	protected readonly DEFAULT_SANKE_POSITIONS: Array<Array<number>> = [
		[3, 0], [2, 0], [1, 0], [0, 0],
	];
	protected typeToSymbolMap: Map<BlockType, string> = new Map<BlockType, string>([
		[BlockType.Empty, "⬜️"], [BlockType.SnakeBody, "⬛️"], [BlockType.Food, "🟥"]
	]);
	protected snakeDirection: Direction;
	protected foodSpawnInterval: number = 1;
	protected lastFoodSpawnTime: number;

	protected updateIntervalId: number = 0;
	protected keypressListener!: (input: string, e: { name: string }) => void;

	protected needRender: boolean = false;

	protected winMenu: WinMenu;
	protected loseMenu: LoseMenu;

	constructor() {
		super();
		this.snakeSpeed = this.DEFAULT_SNAKE_SPEED;
		this.snakeDirection = this.DEFAULT_SNAKE_DIRECTION;
		this.lastSnakeMoveTime = 0;
		this.lastFoodSpawnTime = 0;
		this.grid = new Array<Array<BlockType>>();
		this.snake = new Array<Array<number>>();
		this.winMenu = new WinMenu(this);
		this.loseMenu = new LoseMenu(this);
	}
	public start(): void {
		process.stdout.cursorTo(0, 0);
		process.stdout.clearScreenDown();

		this.snakeSpeed = this.DEFAULT_SNAKE_SPEED;
		this.snakeDirection = this.DEFAULT_SNAKE_DIRECTION;
		this.lastSnakeMoveTime = 0;
		this.lastFoodSpawnTime = 0;
		this.grid = this.generateEmptyGrid();
		this.snake = new Array<Array<number>>(...this.DEFAULT_SANKE_POSITIONS);
		this.snake.forEach(snake => {
			this.grid[snake[0]][snake[1]] = BlockType.SnakeBody;
		});
		this.readline = ReadLine.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		this.keypressListener = (input: string, e: { name: string }) => {
			switch (e.name) {
				case "a":
					this.setDirection(Direction.Left);
					break;
				case "w":
					this.setDirection(Direction.Up);
					break;
				case "s":
					this.setDirection(Direction.Down);
					break;
				case "d":
					this.setDirection(Direction.Right);
					break;
			}
		}
		process.stdin.on("keypress", this.keypressListener);
		const intervalHandler: TimerHandler = this.update.bind(this);
		this.updateIntervalId = setInterval(intervalHandler, this.UPDATE_INTERVAL * 1000);
	}

	protected setDirection(direction: Direction): void {
		this.snakeDirection = direction;
	}

	protected update(): void {
		if (Date.now() - this.lastSnakeMoveTime >= 1 / this.snakeSpeed * 1000) {
			this.moveSnake();
		}
		if (Date.now() - this.lastFoodSpawnTime >= this.foodSpawnInterval * 1000) {
			this.trySpawnFood();
		}
		if (this.needRender) {
			this.renderGrid();
			if (this.snake.length === this.GRID_WIDTH * this.GRID_HEIGHT) {
				this.winGame();
			}
			this.needRender = false;
		}
	}

	protected trySpawnFood(): void {
		const emptys: Array<Array<number>> = this.getBlocksByType(BlockType.Empty);
		if (emptys.length > 0) {
			const random: number = Math.floor(Math.random() * emptys.length);
			const randomEmptyBlock: Array<number> = emptys[random];
			this.grid[randomEmptyBlock[0]][randomEmptyBlock[1]] = BlockType.Food;
			this.lastFoodSpawnTime = Date.now();
			this.needRender = true;
		}
	}

	protected moveSnake(): void {
		const offset: Array<number> = this.diretionToVector(this.snakeDirection);
		const frontBlockPosition: Array<number> = [this.snake[0][0] + offset[0], this.snake[0][1] + offset[1]];
		if (frontBlockPosition[0] < 0 || frontBlockPosition[0] > this.grid.length - 1 ||
			frontBlockPosition[1] < 0 || frontBlockPosition[1] > this.grid[0].length - 1 ||
			this.grid[frontBlockPosition[0]][frontBlockPosition[1]] === BlockType.SnakeBody) {
			this.loseGame();
		} else if (this.grid[frontBlockPosition[0]][frontBlockPosition[1]] === BlockType.Food) {
			this.snake.splice(0, 0, frontBlockPosition);
			this.grid[frontBlockPosition[0]][frontBlockPosition[1]] = BlockType.SnakeBody;
		} else {
			this.grid[frontBlockPosition[0]][frontBlockPosition[1]] = BlockType.SnakeBody;
			this.grid[this.snake[this.snake.length - 1][0]][this.snake[this.snake.length - 1][1]] = BlockType.Empty;
			this.snake = [frontBlockPosition, ...this.snake.slice(0, this.snake.length - 1)];
		}
		this.lastSnakeMoveTime = Date.now();
		this.needRender = true;
	}

	protected async loseGame(): Promise<void> {
		clearInterval(this.updateIntervalId);
		process.stdin.off("keypress", this.keypressListener);
		this.readline.close();
		await Utils.waitForSecond(this.UPDATE_INTERVAL);
		this.loseMenu.show();
	}

	protected async winGame(): Promise<void> {
		clearInterval(this.updateIntervalId);
		process.stdin.off("keypress", this.keypressListener);
		this.readline.close();
		await Utils.waitForSecond(this.UPDATE_INTERVAL);
		this.winMenu.show();
	}

	protected diretionToVector(direction: Direction): Array<number> {
		let result: Array<number> = [];
		switch (direction) {
			case Direction.Left:
				result = [-1, 0];
				break;
			case Direction.Up:
				result = [0, 1];
				break;
			case Direction.Right:
				result = [1, 0];
				break;
			case Direction.Down:
				result = [0, -1];
				break;
		}
		return result;
	}

	protected renderGrid(): void {
		process.stdout.cursorTo(0, 0);
		process.stdout.clearScreenDown();
		const result: Array<Array<BlockType>> = [];
		for (let i: number = this.grid[0].length - 1; i > -1; i--) {
			const arr: Array<BlockType> = []
			for (let j: number = 0; j < this.grid.length; j++) {
				arr.push(this.grid[j][i]);
			}
			result.push(arr);
		}
		result.forEach(arr => process.stdout.write(`${arr.map(type => this.typeToSymbolMap.get(type)).join("")}\n`));
	}

	protected getBlocksByType(type: BlockType): Array<Array<number>> {
		const result: Array<Array<number>> = [];
		for (let i: number = 0; i < this.grid.length; i++) {
			for (let j: number = 0; j < this.grid[i].length; j++) {
				if (this.grid[i][j] === type) {
					result.push([i, j]);
				}
			}
		}
		return result;
	}

	protected generateEmptyGrid(): Array<Array<BlockType>> {
		const result: Array<Array<BlockType>> = [];
		for (let i: number = 0; i < this.GRID_WIDTH; i++) {
			result[i] = [];
			for (let j: number = 0; j < this.GRID_HEIGHT; j++) {
				result[i][j] = BlockType.Empty;
			}
		}
		return result;
	}
}