import assert from "assert";
import { Circuit, CircuitComponent, QuantumMeasureComponent, QuantumSourceComponent, Socket } from "./Circuit";

abstract class Simulator {

    public abstract reset(): void;

    public abstract simulate(circuit: Circuit): void;

}

export { Simulator };