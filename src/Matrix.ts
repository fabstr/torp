import { ItemType } from "./app";

export class Matrix {
    private data: Record<number, Record<number | string, ItemType>>;
    private rows: number;
    private columns: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.columns = cols;
        this.data = {};
        for (let r = 0; r < this.rows; r++) {
            this.data[r] = {};
            for (let c = 0; c < this.columns; c++) {
                this.data[r][c] = ItemType.None;
            };
        }
    }

    public set(row: number, column: number, value: ItemType) {
        if (row >= this.rows || column >= this.columns) {
            throw new Error("Please respect matrix dimensions!");
        }

        this.data[row][column] = value;
    }

    public get(row: number, column: number) {
        if (row >= this.rows || column >= this.columns) {
            throw new Error("Please respect matrix dimensions!");
        }

        const value = this.data[row][column];
        if (value === undefined) {
            return ItemType.None;
        }
        return value;
    }

    public forEach(callback: (row: number, col: number, value: ItemType) => void) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                callback(r, c, this.data[r][c]);
            }
        }
    }

    public static fromJSON(data: number[][]): Matrix {
        const rows = data.length;
        const columns = data[0].length;

        const m = new Matrix(rows, columns);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                m.set(r, c, data[r][c]);
            }
        }

        return m;
    }
}
