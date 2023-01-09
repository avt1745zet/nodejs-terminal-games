export enum Direction {
	Right,
	Down,
	Left,
	Up
}

export enum BlockType {
	Empty,
	SnakeBody,
	Food
}

export interface IMenuItem {
	name: string;
	callback: () => void;
}