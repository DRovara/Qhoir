import { Simulator } from "./Simulator";
import assert from "assert";
import { Circuit, CircuitComponent, QuantumMeasureComponent, QuantumSourceComponent, Socket } from "./Circuit";
import * as math from 'mathjs';
import { Utils } from "./Utils";

class LRUCache {

    private static primes = [
        4397,
        4409,
        4421,
        4423,
        4441,
        4447,
        4451,
        4457,
        4463,
        4481,
        4483,
        4493,
        4507,
        4513,
        4517,
        4519,
        4523,
        4547,
        4549,
        4561,
        4567,
        4583,
        4591,
        4597,
        4603,
        4621,
        4637,
        4639,
        4643,
        4649,
        4651,
        4657,
        4663
    ];

    private resultCache: { [key: string]: math.Matrix } = {};
    private unitaryCache: { [key: number]: math.Matrix } = {};

    private addOrderResults: string[] = [];
    private addOrderUnitaries: number[] = [];

    private maxSize = 200;

    public constructor() {
    }

    public encodeResult(current: math.Matrix, layer: (CircuitComponent | null)[]): string {
        let encoding = 0;
        layer.forEach((component, i) => encoding += (component != null ? component.getComponentId() + 2 : 1) * LRUCache.primes[i]);
        return encoding + "-" + current.toString();
    }

    public encodeUnitary(layer: (CircuitComponent | null)[]): number {
        let encoding = 0;
        layer.forEach((component, i) => encoding += (component != null ? component.getComponentId() + 2 : 1) * LRUCache.primes[i]);
        return encoding;
    }

    public getResult(current: math.Matrix, layer: (CircuitComponent | null)[]): math.Matrix | undefined {
        const encoding = this.encodeResult(current, layer);
        if(encoding in this.resultCache)
            return this.resultCache[encoding];
        return undefined;
    }

    public getUnitary(layer: (CircuitComponent | null)[]): math.Matrix | undefined {
        const encoding = this.encodeUnitary(layer);
        if(encoding in this.unitaryCache)
            return this.unitaryCache[encoding];
        return undefined;
    }

    public storeUnitary(layer: (CircuitComponent | null)[], layerUnitary: math.Matrix) {
        if(layer.some((component) => component != null && (component.getComponentId() == 25 || component.getComponentId() == 26 || component.getComponentId() == 1)))
            return;
        
        const encodingUnitary = this.encodeUnitary(layer);

        const unitaryIndex = this.addOrderUnitaries.indexOf(encodingUnitary);
        if(unitaryIndex != -1) {
            this.addOrderUnitaries.splice(unitaryIndex, 1);
        }
        this.addOrderUnitaries.push(encodingUnitary);
        
        if(this.addOrderUnitaries.length > this.maxSize) {
            const rem = this.addOrderUnitaries.shift() as number;
            delete this.unitaryCache[rem];
        }

        this.unitaryCache[encodingUnitary] = layerUnitary;
    }

    public storeResult(previous: math.Matrix, layer: (CircuitComponent | null)[], result: math.Matrix) {
        if(layer.some((component) => component != null && (component.getComponentId() == 25 || component.getComponentId() == 26 || component.getComponentId() == 1)))
            return;
        
        const encodingResult = this.encodeResult(previous, layer);

        const resultIndex = this.addOrderResults.indexOf(encodingResult);
        if(resultIndex != -1) {
            this.addOrderResults.splice(resultIndex, 1);
        }
        this.addOrderResults.push(encodingResult);
        if(this.addOrderResults.length > this.maxSize) {
            const rem = this.addOrderResults.shift() as string;
            delete this.resultCache[rem];
        }

        this.resultCache[encodingResult] = result;
        
    }
}

class StatevectorAssignments {

    private vectors: math.Matrix[] = [];
    private assignments: { [key: number]: number } = {};
    private probabilities: number[] = [];
    private nextAssignment = 1;

    public constructor(size: number) {
        this.vectors.push(math.matrix(new Array<number>(size).fill(0).map((entry) => [entry])));
        this.vectors[0].set([0, 0], 1);
        this.probabilities.push(1);
    }

    public multiplyAll(unitary: math.Matrix, layer: (CircuitComponent | null)[], cache: LRUCache): void {
        for(let i = 0; i < this.vectors.length; i++) {
            const before = this.vectors[i];
            let result = cache.getResult(before, layer);
            if(result == undefined)
                result = math.multiply(unitary, before);
            this.vectors[i] = result;
            cache.storeResult(before, layer, result);
        }
    }

    public multiply(unitary: math.Matrix, assignment: number, layer: (CircuitComponent | null)[] = [], cache: LRUCache | undefined = undefined): void {
        if(assignment in this.assignments) {
            const before = this.vectors[this.assignments[assignment]];
            let result = cache?.getResult(before, layer);
            if(result == undefined)
                result = math.multiply(unitary, before);
            this.vectors[this.assignments[assignment]] = result;
            if(cache != undefined)
                cache.storeResult(before, layer, result);
        }
        else {
            const next = this.nextAssignment++;

            const before = this.vectors[0];
            let result = cache?.getResult(before, layer);
            if(result == undefined)
                result = math.multiply(unitary, before);
            this.vectors[this.assignments[assignment]] = result;
            if(cache != undefined)
                cache.storeResult(before, layer, result);

            this.vectors.push(result);
            this.assignments[assignment] = next;  
            this.probabilities.push(1);
        }
    }

    public get(index: number, assignment: number): number {
        if(assignment in this.assignments) {
            return this.vectors[this.assignments[assignment]].get([index, 0]);
        }
        return this.vectors[0].get([index, 0]);
    }

    public getVector(assignment: number): math.Matrix {
        if(assignment in this.assignments)
            return this.vectors[this.assignments[assignment]];
        return this.vectors[0];
    }

    public getVectorsAndIndices(): [number, math.Matrix][] {
        return this.vectors.map<[number, math.Matrix]>((vec, i) => [i, vec]);
    }

    public updateProbability(prob: number, assignment: number): void {
        if(assignment in this.assignments) {
            this.probabilities[this.assignments[assignment]] *= prob;
        }
        else {
            const next = this.nextAssignment++;
            this.vectors.push(this.vectors[0]);
            this.assignments[assignment] = next;  
            this.probabilities.push(prob);
        }
    }

    public getProbabilities(entries: number): number[] {
        const result: number[] = [];
        for(let i = 0; i < 2**entries; i++) {
            if(i in this.assignments) {
                result.push(this.probabilities[this.assignments[i]])
            }
            else {
                result.push(this.probabilities[0]);
            }
        }
        return result;
    }

}

class StatevectorSimlator extends Simulator {

    private quantumSources: number[] = [];
    private qubitIndices: { [key: number]: { [key: number]: number } } = {};

    private classicalOutputs: { [key: number]: { [key: number]: number } } = {};
    private classicalGatesToCheck: Set<CircuitComponent> = new Set<CircuitComponent>();

    private cache: LRUCache;

    public constructor() {
        super();
        this.cache = new LRUCache();
    }
    
    public override reset(): void {
        this.quantumSources.length = 0;
        this.qubitIndices = {};

        this.classicalOutputs = {};
        this.classicalGatesToCheck.clear();

    }

    private initSources(subcircuit: CircuitComponent[]): void {
        for(const component of subcircuit) {
            if (component.getComponentId() == 1 && !this.quantumSources.includes(component.getId()))
                this.quantumSources.push(component.getId());
        }        
    }

    private initQubitIndices(source: CircuitComponent): void {
        const qubit = this.quantumSources.indexOf(source.getId());
        let current = source;
        let currentSocket: Socket | undefined = source.getOutputSocket(0);
        
        if(!(current.getId() in this.qubitIndices))
            this.qubitIndices[current.getId()] = {}
        this.qubitIndices[current.getId()][0] = qubit;

        while(true) {
            currentSocket = currentSocket?.getConnectedSocket();
            if(currentSocket == undefined)
                break;

            current = currentSocket.getOwner();

            if(!(current.getId() in this.qubitIndices))
                this.qubitIndices[current.getId()] = {}
            this.qubitIndices[current.getId()][currentSocket.getSocketIndex()] = qubit;
            currentSocket = currentSocket.getCorrespondingInputOutput();
            if(currentSocket == undefined)
                break;
            this.qubitIndices[current.getId()][currentSocket.getSocketIndex()] = qubit;
        }
    }

    private initClassicalGates(subcircuit: CircuitComponent[]) {
        subcircuit.forEach((component) => { 
            if(component.getInputSockets().some((socket) => socket.isQuantum()) || component.getOutputSockets().some((socket) => socket.isQuantum()))
                return;
            this.classicalGatesToCheck.add(component);
            this.classicalOutputs[component.getId()] = {};
            component.getOutputSockets().forEach((socket) => this.classicalOutputs[component.getId()][socket.getSocketIndex()] = -1);
            component.setUncomputed(true);
        });
        
    }

    public override simulate(circuit: Circuit): void {
        const subcircuits = circuit.getAllSubCircuits();
        subcircuits.forEach((subcircuit) => this.simulateSubcircuit(circuit, subcircuit));
    }

    private simulateSubcircuit(circuit: Circuit, subcircuit: CircuitComponent[]) {
        this.reset();
        this.initClassicalGates(subcircuit);

        this.simulateClassicalParts();

        this.initSources(subcircuit);

        
        this.quantumSources.forEach((source) => this.initQubitIndices(circuit.getComponent(source)!));

        const measureGroups = this.getMeasureSets(circuit, subcircuit);
        for(const group of measureGroups) {
            const n = group.length;
            if(n == 0)
                continue;
            const results = this.simulateQuantumParts(circuit, subcircuit, group);

            let measureBitIndex = 0;
            for(const measure of group) {
                measure.setBuckets(results);
                measure.setQubitIndex(measureBitIndex++);
            }
        }

        this.simulateQuantumParts(circuit, subcircuit, []);
    }

    private getMeasureSets(circuit: Circuit, subcircuit: CircuitComponent[]): QuantumMeasureComponent[][] {
        const groups: QuantumMeasureComponent[][] = [];

        for(let i = 1; i <= 3; i++) {
            groups.push(subcircuit.filter<QuantumMeasureComponent>((component): component is QuantumMeasureComponent => (component instanceof QuantumMeasureComponent) && component.getMeasureGroup() == i && component.getId() in this.qubitIndices)
                .sort((x, y) => this.qubitIndices[x.getId()][0] - this.qubitIndices[y.getId()][0]));
        }

        return groups;
    }

    private simulateQuantumParts(circuit: Circuit, subcircuit: CircuitComponent[], measureAssignments: QuantumMeasureComponent[]): number[] {
        for(const sub of subcircuit.filter((component) => component.getInputSockets().some((socket) => socket.isQuantum()) || component.getOutputSockets().some((socket) => socket.isQuantum()))) {
            sub.setUncomputed(true);
        }


        if(this.quantumSources.length == 0)
            return [];


        const quantumBandwidth = this.quantumSources.length;
        const matrixSize = 2**quantumBandwidth;

        const layers = this.layerize(circuit, subcircuit, quantumBandwidth);

        let state = new StatevectorAssignments(matrixSize);

        for(const layer of layers) {
            let layerUnitary: math.Matrix | undefined = this.cache.getUnitary(layer);
            if(layerUnitary == undefined) {
                layerUnitary = math.identity(matrixSize, matrixSize) as math.Matrix;
                const alreadyAdded = new Set<number>();

                for(let i = 0; i < layer.length; i++) {
                    if(layer[i] == null || alreadyAdded.has(layer[i]!.getId()))
                        continue
                    alreadyAdded.add(layer[i]!.getId());
                    const other = layer[i]!.getUnitary([], quantumBandwidth, layer[i]!.getOutputSockets().map((socket) => this.qubitIndices[layer[i]!.getId()][socket.getSocketIndex()]));
                    layerUnitary = math.multiply(layerUnitary, other);
                }
            }

            state.multiplyAll(layerUnitary, layer, this.cache);

            this.cache.storeUnitary(layer, layerUnitary!);

            for(let assign = 0; assign < 2**measureAssignments.length; assign++) {
                for(let i = 0; i < layer.length; i++) {
                    if(layer[i] instanceof QuantumMeasureComponent) {
                        const stepSize = 2**(quantumBandwidth - i - 1);

                        let totalZero = 0;
                        for(let j = 0; j < matrixSize; j += 2*stepSize) {
                            for(let k = 0; k < stepSize; k++) {
                                const value = state.get(j + k, assign);
                                totalZero += math.multiply(math.abs(value), math.abs(value));
                            }
                        }


                        if(measureAssignments.length == 0) {
                            (layer[i]! as QuantumMeasureComponent).setOneRate(1 - totalZero);
                        }



                        if(measureAssignments.includes(layer[i] as QuantumMeasureComponent)) {
                            const assignment = (assign & (1 << (measureAssignments.length - 1 -measureAssignments.indexOf(layer[i]! as QuantumMeasureComponent)))) > 0 ? 1 : 0;
                            totalZero = Math.abs(totalZero - assignment);
                            state.updateProbability(totalZero, assign);

                            let measureUpdateObservable = math.zeros(2, 2) as math.Matrix;
                            measureUpdateObservable.set([assignment, assignment], 1);
                            measureUpdateObservable = math.multiply(measureUpdateObservable, 1/(totalZero**0.5));
                            const measureFullObservable = Utils.tensorPad(i, quantumBandwidth - i - 1, measureUpdateObservable);

                            state.multiply(measureFullObservable, assign);
                        }
                    }
                }
            }
        }

        return state.getProbabilities(measureAssignments.length);

    }

    private simulateClassicalParts() {
        let repeat = true;

        while(repeat) {
            repeat = false;

            const checkedGates: CircuitComponent[] = [];

            this.classicalGatesToCheck.forEach((gate) => {
                const inputs = gate.getInputSockets().map((socket) => socket.getWire() == null ? -1 : (this.classicalOutputs[socket.getWire()?.getWireStart().getOwner().getId()!][socket.getWire()?.getWireStart().getSocketIndex()!]));
                if(inputs.includes(-1))
                    return;
                
                checkedGates.push(gate);
                gate.setUncomputed(false);
                
                const outputs = gate.getClassicalOutput(inputs);
                for(let i = 0; i < outputs.length; i++) {
                    this.classicalOutputs[gate.getId()][gate.getOutputSockets()[i].getSocketIndex()] = outputs[i] ? 1 : 0;
                }
            });
            for(const checkedGate of checkedGates) {
                this.classicalGatesToCheck.delete(checkedGate);
                repeat = true;
            }
        }
    }

    private layerize(circuit: Circuit, subcircuit: CircuitComponent[], quantumBandwidth: number): (CircuitComponent | null)[][] {
        const result: (CircuitComponent | null)[][] = [];

        //const toLayerize: CircuitComponent[] = subcircuit.filter((component) => component.getInputSockets().some((socket) => socket.isQuantum()));
        const toLayerize: CircuitComponent[] = subcircuit.filter((component) => (component.getInputSockets().some((socket) => socket.isQuantum()) || component.getOutputSockets().some((socket) => socket.isQuantum())) && component.getInputSockets().every((socket) => socket.getWire() != null));
        const alreadyLayerized = new Set<CircuitComponent>();

        while(toLayerize.length > 0) {
            let changed = false;
            const current = Array<CircuitComponent | null>(quantumBandwidth).fill(null);
            const toRemove: CircuitComponent[] = [];

            for(const component of toLayerize) {
                if(component.getInputSockets().some((socket) => socket.getWire() == null || (socket.isQuantum() && !alreadyLayerized.has(socket.getConnectedSocket()?.getOwner()!))))
                    continue;
                if(component instanceof QuantumSourceComponent) {
                    const qubit = this.qubitIndices[component.getId()][0];
                    assert(current[qubit] == null);
                    current[qubit] = component;
                }
                else {
                    for(const socket of component.getInputSockets()) {
                        if(!socket.isQuantum())
                            continue;
                        const qubit = this.qubitIndices[component.getId()][socket.getSocketIndex()];
                        assert(current[qubit] == null);
                        current[qubit] = component;
                    }
                }
                toRemove.push(component);
            }
            for(const component of toRemove) {
                component.setUncomputed(false);
                toLayerize.splice(toLayerize.indexOf(component), 1);
                alreadyLayerized.add(component);
                changed = true;
            }
            result.push(current);
            if(!changed)
                break;
        }



        return result;
    }

}

export { StatevectorSimlator }