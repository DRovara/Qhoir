import { Circuit, CircuitComponent } from "./Circuit";

class ComponentState {

}

class Simulator {

    private quantumSources: number[] = [];
    private classicalSources: number[] = [];
    private qubitIndices: { [key: number]: { [key: number]: number } } = {};
    
    public reset(): void {
        this.quantumSources.length = 0;
        this.classicalSources.length = 0;
        this.qubitIndices = {};
    }

    private initSources(component: CircuitComponent): void {
        if (component.getComponentId() == 0 && !this.classicalSources.includes(component.getId()))
            this.classicalSources.push(component.getId());
        if (component.getComponentId() == 1 && !this.quantumSources.includes(component.getId()))
            this.quantumSources.push(component.getId());
        
        component.getInputSockets().forEach((socket) => socket.getWire()?.getWireStart().getOwner());
    }

    private initQubitIndices(source: CircuitComponent): void {
        const qubit = this.quantumSources.indexOf(source.getId());
        let current = source;
        let currentSocket = 0;
        
        if(!Object.keys(this.qubitIndices).includes(current.getId().toString()))
            this.qubitIndices[current.getId()] = {}
        this.qubitIndices[current.getId()][current.getInputSockets()[currentSocket].getSocketIndex()] = qubit;

        while(current.getOutputSockets().length > currentSocket && current.getOutputSockets()[currentSocket].getWire() != null) {
            const newInputSocket = current.getOutputSockets()[currentSocket].getWire()!.getWireEnd();
            current = newInputSocket.getOwner();
            currentSocket = newInputSocket.getSocketIndex();

            if(!Object.keys(this.qubitIndices).includes(current.getId().toString()))
                this.qubitIndices[current.getId()] = {}
            this.qubitIndices[current.getId()][current.getInputSockets()[currentSocket].getSocketIndex()] = qubit;
        }
    }

    public simulate(sinks: CircuitComponent[], circuit: Circuit): void {
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