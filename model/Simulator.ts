import { Circuit, CircuitComponent, Socket } from "./Circuit";

class ComponentState {

}

class Simulator {

    private quantumSources: number[] = [];
    private qubitIndices: { [key: number]: { [key: number]: number } } = {};

    private classicalOutputs: { [key: number]: { [key: number]: number } } = {};
    private classicalGatesToCheck: Set<CircuitComponent> = new Set<CircuitComponent>();
    
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
            currentSocket = currentSocket?.getConnectedSocket()?.getCorrespondingInputOutput();
            if(currentSocket == undefined)
                break;

            current = currentSocket.getOwner();

            if(current.getId() in this.qubitIndices)
                this.qubitIndices[current.getId()] = {}
            this.qubitIndices[current.getId()][currentSocket.getSocketIndex()] = qubit;
        }
    }

    private initClassicalGates(subcircuit: CircuitComponent[]) {
        subcircuit.forEach((component) => { 
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
        this.initSources(subcircuit);
        this.quantumSources.forEach((source) => this.initQubitIndices(circuit.getComponent(source)!));

        const quantumBandwidth = this.quantumSources.length;

        this.simulateClassicalParts();
    }

    public simulate_temp(sinks: CircuitComponent[], circuit: Circuit): void {
        //TODO classical simulation
        sinks.forEach((sink) => this.initSources(sink));

        const quantumBandwidth = this.quantumSources.length;
        const classicalBandwidth = this.classicalSources.length;

        this.quantumSources.forEach((source) => this.initQubitIndices(circuit.getComponent(source)!));

        const computedComponents = new Set<number>();
        this.quantumSources.forEach((source) => computedComponents.add(source));

        const statevector: number[] = [];
        for(let i = 0; i < 2**quantumBandwidth; i++) {
            statevector.push(0);
        }
        statevector[0] = 1;

        while(true) {

            const nextGates: number[] = [];
            circuit.getComponents().forEach((component) => {
                if(computedComponents.has(component.getId()))
                    return;
                if(component.getInputSockets().some((socket) => socket.getWire() == null || (socket.isQuantum() && !computedComponents.has(socket.getWire()?.getWireStart().getOwner().getId()!))))
                    return;
                nextGates.push(component.getId());
            });

            if(nextGates.length == 0)
                break;

            //TODO measurements

            const matrix = this.getUnitary(nextGates.map((value) => circuit.getComponent(value)!));
            this.evolve(statevector, matrix);
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
}

export { Simulator };