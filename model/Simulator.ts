import assert from "assert";
import { Circuit, CircuitComponent, QuantumMeasureComponent, QuantumSourceComponent, Socket } from "./Circuit";
import { Matrix, Vector } from "./Matrix";

class ComponentState {

}

class Simulator {

    private quantumSources: number[] = [];
    private qubitIndices: { [key: number]: { [key: number]: number } } = {};

    private classicalOutputs: { [key: number]: { [key: number]: number } } = {};
    private classicalGatesToCheck: Set<CircuitComponent> = new Set<CircuitComponent>();

    private quantumMeasurements: { [key: number]: number } = {};
    
    public reset(): void {
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

        while(true) { //TODO prevent endless loops in self-reference
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

    public simulate(circuit: Circuit): void {
        const subcircuits = circuit.getAllSubCircuits();

        subcircuits.forEach((subcircuit) => this.simulateSubcircuit(circuit, subcircuit));
    }

    private simulateSubcircuit(circuit: Circuit, subcircuit: CircuitComponent[]): void {
        this.reset();
        this.initClassicalGates(subcircuit);

        this.simulateClassicalParts();
        this.simulateQuantumParts(circuit, subcircuit);
    }

    private simulateQuantumParts(circuit: Circuit, subcircuit: CircuitComponent[]): void {
        this.initSources(subcircuit);


        if(this.quantumSources.length == 0)
            return;

        this.quantumSources.forEach((source) => this.initQubitIndices(circuit.getComponent(source)!));


        const quantumBandwidth = this.quantumSources.length;

        const layers = this.layerize(circuit, subcircuit, quantumBandwidth);


        let current = new Vector(2**quantumBandwidth, false, new Array<number>(2**quantumBandwidth).fill(0).map((val, idx) => idx == 0 ? 1 : 0));

        for(const layer of layers) {
            let layerUnitary = Matrix.makeIdentity(2**quantumBandwidth);
            const alreadyAdded = new Set<number>();

            for(let i = 0; i < layer.length; i++) {
                if(layer[i] == null || alreadyAdded.has(layer[i]!.getId()))
                    continue
                alreadyAdded.add(layer[i]!.getId());
                const other = layer[i]!.getUnitary([], quantumBandwidth, layer[i]!.getOutputSockets().map((socket) => this.qubitIndices[layer[i]!.getId()][socket.getSocketIndex()]));
                layerUnitary = layerUnitary.matrixMultiplication(other);
            }


            for(let i = 0; i < layer.length; i++) {
                if(layer[i] instanceof QuantumMeasureComponent) {
                    const stepSize = 2**(quantumBandwidth - i - 1);

                    let totalZero = 0;
                    for(let j = 0; j < current.length(); j += 2*stepSize) {
                        for(let k = 0; k < stepSize; k++) {
                            totalZero += current.getVector()[j + k]**2;
                        }
                    }
                    (layer[i] as QuantumMeasureComponent).setOneRate(1 - totalZero);
                    this.quantumMeasurements[layer[i]!.getId()] = 1 - totalZero;
                }
            }

            current = layerUnitary?.multiplyVector(current);
        }

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

    private getUnitary(gates: CircuitComponent[]): number[][] {
        return [[0]]; //TODO
    }

    private evolve(statevector: number[], matrix: number[][]): void {
        //TODO
    }

    public getState(component: CircuitComponent): ComponentState {
        return new ComponentState();
    } 

    private layerize(circuit: Circuit, subcircuit: CircuitComponent[], quantumBandwidth: number): (CircuitComponent | null)[][] {
        const result: (CircuitComponent | null)[][] = [];

        //const toLayerize: CircuitComponent[] = subcircuit.filter((component) => component.getInputSockets().some((socket) => socket.isQuantum()));
        const toLayerize: CircuitComponent[] = subcircuit.filter((component) => (component.getInputSockets().some((socket) => socket.isQuantum()) || component.getOutputSockets().some((socket) => socket.isQuantum())) && component.getInputSockets().every((socket) => socket.getWire() != null));
        const alreadyLayerized = new Set<CircuitComponent>();

        for(const sub of subcircuit) {
            sub.setUncomputed(true);
        }

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

export { Simulator };