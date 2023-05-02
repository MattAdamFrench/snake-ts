import { useEffect, useState } from "react"



type Props = {
    gameSize: { w: number, h: number }
    snakeStartLength: number
}

type Position = {
    x: number
    y: number
}

enum Direction {
    Up, Down, Left, Right
}

enum TileType {
    Empty, SnakeBody, SnakeHead, Food
}

type GameBoard = TileType[][]


class SnakeGame {
    private snake: Position[]
    private foods: Position[]
    private _playing: boolean


    private boardWidth: number;
    private boardHeight: number;
    private onGameEnd: (success: boolean) => void;

    constructor(w: number, h: number, snakeStartLength: number, onGameEnd: (success: boolean) => void) {
        this.boardWidth = w;
        this.boardHeight = h;

        this.snake = [];

        // Create the snake
        for (let i = 0; i < snakeStartLength; i++) {
            this.snake.push({ x: Math.floor(w / 2) + i, y: Math.floor(h / 2) });
        }

        this.foods = [this.findNewFoodPosition()]
        this._playing = false
        this.onGameEnd = onGameEnd;
    }



    endGame(success: boolean) {
        this.playing = false
        this.onGameEnd(success)
    }


    isMovingBackwards(action: Direction): boolean {

        let snakeHeadPos = this.snake[0];

        if (this.snake.length > 1) {
            let snakeNeckPos = this.snake[1];
            switch (action) {
                case Direction.Up:
                    if (snakeHeadPos.y - 1 === snakeNeckPos.y) {
                        return true;
                    }
                    break;
                case Direction.Down:
                    if (snakeHeadPos.y + 1 === snakeNeckPos.y) {
                        return true;
                    }
                    break;
                case Direction.Left:
                    if (snakeHeadPos.x - 1 === snakeNeckPos.x) {
                        return true;
                    }
                    break;
                case Direction.Right:
                    if (snakeHeadPos.x + 1 === snakeNeckPos.x) {
                        return true;
                    }
                    break;
            }
        }

        return false;
    }

    findNewFoodPosition(): Position {

        // Another way of finding positions is by randomly generating positions until we find one that is empty
        // This is less efficient than the method here (especially at full boards), but it is simpler to understand

        let board = this.board;

        let emtpyTiles: Position[] = [];
        for (let x = 0; x < this.boardWidth; x++) {
            for (let y = 0; y < this.boardHeight; y++) {
                if (board[x][y] === TileType.Empty) {
                    emtpyTiles.push({ x: x, y: y });
                }
            }
        }

        let newFoodPos: Position;
        if (emtpyTiles.length > 0) {
            let randomIndex = Math.floor(Math.random() * emtpyTiles.length);
            newFoodPos = emtpyTiles[randomIndex];
            return newFoodPos;
        }

        throw new Error("No empty tiles to place food");
    }

    gameTick(action: Direction) {
        console.log("Game tick");

        // (0, 0) is the top left corner
        // (0, 1) is the tile below (0, 0)
        // (1, 0) is the tile to the right of (0, 0)

        // Game tick logic
        // 1. Figure out the proposed new head position
        //      a. Check if we moved backwards and ignore the move if we did (e.g. if the neck is in the direction we are moving)
        // 2. Check if we can move there
        //      a. Check if we moved off the board
        //      b. Check if we moved backwards
        //      c. Check if we moved into ourselves
        // 3. Check if we will eat food
        //      a. If we will eat food, add a new food, and add a new snake body element
        //      b. If we won't eat food, remove the last element of the snake
        // 4. Check if we have won
        //      a. If we have won, end the game

        // Get the current snake head position
        let snakeHeadPos = this.snake[0];


        // Check we're not moving backwards (e.g. if the neck is in the direction we are moving)
        if (this.isMovingBackwards(action)) {
            this.endGame(false);  // TODO: Make this not end the game
            return;
        }

        // Figure out the proposed new head position, e.g. if we are moving up, the new head position is one above the current head position
        let proposedHeadPos: Position;
        switch (action) {
            case Direction.Up:
                proposedHeadPos = { x: snakeHeadPos.x, y: snakeHeadPos.y - 1 };
                break;
            case Direction.Down:
                proposedHeadPos = { x: snakeHeadPos.x, y: snakeHeadPos.y + 1 };
                break;
            case Direction.Left:
                proposedHeadPos = { x: snakeHeadPos.x - 1, y: snakeHeadPos.y };
                break;
            case Direction.Right:
                proposedHeadPos = { x: snakeHeadPos.x + 1, y: snakeHeadPos.y };
                break;
        }

        // Check if we moved off the board (e.g. if the proposed head position is outside the board)
        if (proposedHeadPos.x < 0 || proposedHeadPos.x >= this.boardWidth || proposedHeadPos.y < 0 || proposedHeadPos.y >= this.boardHeight) {
            this.endGame(false);
            return;
        }

        // Check if we moved into ourselves (e.g. if the proposed head position is in the snake array)
        if (this.snake.some((pos, i) => i !== 0 && pos.x === proposedHeadPos.x && pos.y === proposedHeadPos.y)) {
            this.endGame(false);
            return;
        }

        // Check if we will eat food
        let willEat = false;
        if (this.foods.some(pos => pos.x === proposedHeadPos.x && pos.y === proposedHeadPos.y)) {

            // Remove the food we will eat from the food array
            this.foods = this.foods.filter(pos => pos.x !== proposedHeadPos.x || pos.y !== proposedHeadPos.y);

            // Add a new food
            this.foods.push(this.findNewFoodPosition());

            willEat = true;
        }

        // Generate the proposed new snake array
        // We generate the new snake by adding the proposed head position to the front of the snake array
        // and removing the last element of the snake array (unless we will eat food, in which case we don't remove the last element)
        let newSnake: Position[] = [proposedHeadPos, ...this.snake];
        if (!willEat) {
            newSnake.pop();
        }

        // Update the snake array
        this.snake = newSnake;

        // Check if we have won (e.g. if the snake is the size of the board)
        if (this.snake.length === this.boardWidth * this.boardHeight) {
            this.endGame(true);
            return;
        }
    }

    get board(): GameBoard {

        // Create an empty board
        let board: GameBoard = [];

        for (let i = 0; i < this.boardWidth; i++) {
            board[i] = []
            for (let j = 0; j < this.boardHeight; j++) {
                board[i][j] = TileType.Empty
            }
        }

        // Add snake
        this.snake?.forEach((pos, i) => {
            board[pos.x][pos.y] = i === 0 ? TileType.SnakeHead : TileType.SnakeBody
        });

        // Add food
        this.foods?.forEach(pos => {
            board[pos.x][pos.y] = TileType.Food
        });

        return board;
    }

    get playing(): boolean {
        return this._playing;
    }

    set playing(value: boolean) {
        this._playing = value;
    }

}


export default function Game(props: Props) {

    const createGame = () => {
        return new SnakeGame(10, 10, 3, (success) => alert(success ? "You won!" : "You lost!"));
    }

    const [game, setGame] = useState<SnakeGame>(createGame());
    const [lastTick, setLastTick] = useState<Date>(new Date());


    // Run game tick every second
    useEffect(() => {
        console.log("useEffect");
        const interval = setInterval(() => {
            if (game.playing) {
                game.gameTick(Direction.Up);
                setLastTick(new Date());
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [game, game.playing]);

    return (
        <div>
            <h1>Snake</h1>
            <button onClick={() => game.playing = true}>Start</button>
            <button onClick={() => game.playing = false}>Stop</button>
            <button onClick={() => setGame(createGame())}>Reset</button>

            <div style={{ display: "flex", flexDirection: "column" }}>
                {game.board.map((row, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "row" }}>
                        {row.map((tile, j) => {
                            let color = "white";
                            switch (tile) {
                                case TileType.Empty:
                                    color = "white";
                                    break;
                                case TileType.SnakeHead:
                                    color = "green";
                                    break;
                                case TileType.SnakeBody:
                                    color = "lightgreen";
                                    break;
                                case TileType.Food:
                                    color = "red";
                                    break;
                            }

                            return (
                                <div key={j} style={{ border: 1, borderColor: "black", borderStyle: "solid", width: 20, height: 20, backgroundColor: color }}></div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}