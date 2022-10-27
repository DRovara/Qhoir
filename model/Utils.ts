import * as math from 'mathjs';


class Utils {
    public static tensorPad(before: number, after: number, matrix: math.Matrix) {
        const beforeSize = 2**before;
        const afterSize = 2**after;
        const leftMatrix = math.identity(beforeSize, beforeSize) as math.Matrix;
        const rightMatrix = math.identity(afterSize, afterSize) as math.Matrix;

        return math.kron(leftMatrix, math.kron(matrix, rightMatrix));
    }
}

export { Utils }