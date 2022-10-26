class Matrix {
    private _rows: number;
    private _columns: number;

    private matrix: number[][];

    public static makeIdentity(size: number): Matrix {
        const mat = new Matrix(size, size);
        for(let i = 0; i < size; i++) {
            mat.matrix[i][i] = 1;
        }
        return mat;
    }

    public static fromArray(array: number[][]): Matrix {
        return new Matrix(array.length, array.length > 0 ? array[0].length : 0, array);
    }

    public static tensorPad(before: number, after: number, matrix: Matrix) {
        const leftMatrix = Matrix.makeIdentity(2**before);
        const rightMatrix = Matrix.makeIdentity(2**after);

        return leftMatrix.tensorProduct(matrix.tensorProduct(rightMatrix));
    }

    public constructor(rows: number, columns: number, array: number[][] | null = null) {
        this._rows = rows;
        this._columns = columns;

        if(array == null) {
            this.matrix = Array(rows).fill(0).map(() => Array(columns).fill(0));
            return;
        }

        this.matrix = array.map((row) => row.map((val) => val));
    }

    public rows(): number {
        return this._rows;
    }

    public columns(): number {
        return this._columns;
    }

    public get(row: number, column: number): number {
        return this.matrix[row][column];
    }

    public add(other: Matrix): Matrix {
        if(other._columns != this._columns || other._rows != this._rows)
            throw "Matrices must have identical dimensions";
        const mat = new Matrix(this._rows, this._columns);
        
        for(let i = 0; i < this._rows; i++) {
            for(let j = 0; j < this._columns; j++) {
                mat.set(i, j, this.matrix[i][j] + other.matrix[i][j]);
            }
        }

        return mat;
    }

    public multipy(other: number): Matrix {
        return Matrix.fromArray(this.matrix.map((row) => row.map((cell) => cell * other)));
    }

    public tensorProduct(other: Matrix): Matrix {
        const matr = new Matrix(this.rows() * other.rows(), this.columns() * other.columns());

        for(let i1 = 0; i1 < this.rows(); i1++) {
            for(let j1 = 0; j1 < this.columns(); j1++) {
                for(let i2 = 0; i2 < other.rows(); i2++) {
                    for(let j2 = 0; j2 < other.columns(); j2++) {
                        matr.set(i2 + i1 * other.rows(), j2 + j1 * other.columns(), this.matrix[i1][j1] * other.matrix[i2][j2]);
                    }
                }
            }
        }
        return matr;
    }

    public matrixMultiplication(other: Matrix): Matrix {
        if(this.columns() != other.rows())
            throw "Matrix multiplication only works with m x n and n x k matrices";
        const mat = new Matrix(this.rows(), other.columns());

        for(let i = 0; i < mat.rows(); i++) {
            for(let j = 0; j < mat.columns(); j++) {
                for(let k = 0; k < this.columns(); k++) {
                    mat.matrix[i][j] += this.matrix[i][k] * other.matrix[k][j];
                }
            }
        }

        return mat;
    }

    public set(row: number, col: number, value: number): void {
        this.matrix[row][col] = value;
    }

    public multiplyVector(vector: Vector): Vector {
        return new Vector(vector.length(), false, this.matrix.map((row) => row.reduce((prev, current, i) => prev + current * vector.getVector()[i], 0)));
    }

    public getMatrix(): number[][] {
        return this.matrix;
    }

    public toString(): string {
        return this.matrix.map((row) => row.join(" ")).join("\n")
    }
}

class Vector {

    private _length: number;
    private vector: number[];
    private row: boolean;

    public static fromBraKet(braKet: string): Vector {
        if(braKet[0] == "|" && braKet[braKet.length - 1] == ">")
            return Vector.fromKet(braKet.substring(1, braKet.length - 1));
        if(braKet[0] == "<" && braKet[braKet.length - 1] == "|")
            return Vector.fromBra(braKet.substring(1, braKet.length - 1));
        throw "invalid bra/ket string";
    }

    public static fromBra(input: string | number[]): Vector {
        let bits: number[] = []; 
        if(typeof input == "string") {
            bits = input.split("").map(parseInt);
        }
        else {
            bits = input;
        }

        let binary = 0;
        for(const bit of bits) {
            binary += bit;
            binary *= 2;
        }

        const vector = new Vector(2**bits.length, true);
        vector.vector[binary] = 1;
        return vector;
    }

    public static fromKet(input: string | number[]): Vector {
        let bits: number[] = []; 
        if(typeof input == "string") {
            bits = input.split("").map(parseInt);
        }
        else {
            bits = input;
        }

        let binary = 0;
        for(const bit of bits) {
            binary += bit;
            binary *= 2;
        }

        const vector = new Vector(2**bits.length, false);
        vector.vector[binary] = 1;
        return vector;
    }

    public constructor(length: number, row: boolean, vector: number[] | null = null) {
        this._length = length;
        if(vector == null)
            this.vector = Array(length).fill(0);
        else
            this.vector = vector.map((x) => x);
        this.row = row;
    }

    public length(): number {
        return this._length;
    }

    public dotProduct(other: Vector): number {
        if(this._length != other._length || this.row != other.row)
            throw "Vectors must be same type and have the same size to add them together."
        return this.vector.map((val, idx) => val * other.vector[idx]).reduce((x, y) => x + y, 0);
    }

    public add(other: Vector): Vector {
        if(this._length != other._length || this.row != other.row)
            throw "Vectors must be same type and have the same size to add them together."

        const vec = new Vector(this._length, this.row);
        for(let i = 0; i < this._length; i++) {
            vec.vector[i] = this.vector[i] + other.vector[i];
        }
        return vec;
    }

    public multipy(other: number): Vector {
        return new Vector(this._length, this.row, this.vector.map((x) => x * other));
    }

    public tensorProduct(other: Vector): Vector {
        const vec = new Vector(this._length * other.length(), this.row);
        for(let i = 0; i < this._length; i++) {
            for(let j = 0; j < other._length; j++) {
                vec.vector[j + i * other._length] =this.vector[i] * other.vector[j];
            }
        }
        return vec;
    }

    public get(index: number): number {
        return this.vector[index];
    }

    public toMatrix(): Matrix {
        if(this.row) {
            return Matrix.fromArray([this.vector]);
        }
        else {
            return Matrix.fromArray(this.vector.map((x) => [x]));
        }
    }

    public multiplyVector(other: Vector): Vector | Matrix | number {
        if(this.row && !other.row)
            return this.dotProduct(other);
        if(!this.row && other.row)
            return this.toMatrix().matrixMultiplication(other.toMatrix());
        return this.tensorProduct(other);
    }

    public getVector(): number[] {
        return this.vector;
    }
}

export { Matrix, Vector };