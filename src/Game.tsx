import { useState } from "react"



type Props = {
    gameSize: { w: number, h: number }
    snakeStartLength: number
}

type GameState = {
    board: TileType[][]
    snake: { x: number, y: number }[]
    food: { x: number, y: number }
    playing: boolean
}

enum Direction {
    Up, Down, Left, Right
}

enum TileType { 
    Empty, Snake, Food
}

type GameBoard = TileType[][]

function createBoard(width: number, height: number): GameBoard {
    const board: GameBoard = []

    for (let i = 0; i < width; i++) {
        board[i] = []
        for (let j = 0; j < height; j++) {
            board[i][j] = TileType.Empty
        }
    }

    return board;
}

export default function Game(props: Props) {

    
    const [gameState, setGameState] = useState<GameState>({
        board: createBoard(props.gameSize.w, props.gameSize.h),
        snake: [],
        food: { x: 0, y: 0 },
        playing: false
    });


    return (
        <div>
            <h1>Snake</h1>
            <button onClick={() => setGameState({ ...gameState, playing: true })}>Start</button>
            <button onClick={() => setGameState({ ...gameState, playing: false })}>Stop</button>
            <button onClick={() => setGameState({ ...gameState, playing: false })}>Reset</button>

            <div style={{ display: "flex", flexDirection: "column" }}>
                {gameState.board.map((row, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "row" }}>
                        {row.map((tile, j) => (
                            <div key={j} style={{ border: 2, width: 20, height: 20, backgroundColor: tile === TileType.Empty ? "white" : tile === TileType.Snake ? "green" : "red" }}></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}