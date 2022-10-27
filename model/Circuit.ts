import { View } from "./View";
import { componentTypes} from "../model/ComponentTypes"
import { Simulator } from "./Simulator";
import { Matrix, Vector } from "./Matrix";

class Socket {
    private socketIndex: number;
    private input: boolean;
    private quantum: boolean;

    private owner: CircuitComponent;
    
    private hovered: boolean = false;
    private selected: boolean = false;
    private wire: Wire | null = null;

    private x: number;
    private y: number;

    public constructor(x: number, y: number, socketIndex: number, input: boolean, quantum: boolean, owner: CircuitComponent) {
        this.socketIndex = socketIndex;
        this.input = input;
        this.quantum = quantum;
        this.x = x;
        this.y = y;
        this.owner = owner;
    }

    public setWire(wire: Wire | null): void {
        this.wire = wire;
    }

    public render(view: View, x: number, y: number): void {
        const ctx = view.getDrawingContext();

        const width = 16;
        const height = 16;

        ctx.imageSmoothingEnabled = false;

        const image = this.hovered || this.selected ?
            (this.quantum ? Circuit.quantumHoveredSocketImage : Circuit.hoveredSocketImage) :
            (this.quantum ? Circuit.quantumSocketImage : Circuit.socketImage);
            

        ctx.drawImage(image, x + this.x - width / 2, y + this.y - height / 2, width, height);

        if(this.input) {
            ctx.save();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.ellipse(x + this.x, y + this.y, width / 8, height / 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    
        this.wire?.render(view);
    }

    public setHovered(hovered: boolean): void {
        this.hovered = hovered;
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public isQuantum(): boolean {
        return this.quantum;
    }

    public isInput(): boolean {
        return this.input;
    }

    public getOwner(): CircuitComponent {
        return this.owner;
    }

    public getWire(): Wire | null {
        return this.wire;
    }

    public getSocketIndex(): number {
        return this.socketIndex;
    }

    public getCorrespondingInputOutput(): Socket | undefined {
        const owner = this.owner;
        const myList = this.input ? owner.getInputSockets() : owner.getOutputSockets();
        const oppositeList = !this.input ? owner.getInputSockets() : owner.getOutputSockets();

        const idx = myList.indexOf(this);
        if(idx >= oppositeList.length)
            return undefined;
        return oppositeList[idx];
    }

    public getConnectedSocket(): Socket | undefined {
        if(this.input)
            return this.wire?.getWireStart();
        return this.wire?.getWireEnd();
    }
}

class Wire {
    private wireStart: Socket;
    private wireEnd: Socket;

    public constructor(wireStart: Socket, wireEnd: Socket) {
        this.wireStart = wireStart;
        this.wireEnd = wireEnd;
    }

    public setWireStart(wireStart: Socket): void {
        this.wireStart = wireStart;
    }

    public setWireEnd(wireEnd: Socket): void {
        this.wireEnd = wireEnd;
    }

    public getWireStart(): Socket {
        return this.wireStart;
    }

    public getWireEnd(): Socket {
        return this.wireEnd;
    }

    public render(view: View): void {
        const socketSize = 16;
        const fromX = this.wireStart.getX() + this.wireStart.getOwner().getX() + view.getScrollX();
        const fromY = this.wireStart.getY() + this.wireStart.getOwner().getY() + view.getScrollY();
        const toX = this.wireEnd.getX() + this.wireEnd.getOwner().getX() + view.getScrollX();
        const toY = this.wireEnd.getY() + this.wireEnd.getOwner().getY() + view.getScrollY();

        const context = view.getDrawingContext();
        context.save();

        const errorWire = this.wireStart.getOwner().isUncomputed() && this.wireEnd.getOwner().isUncomputed();

        context.strokeStyle = errorWire ? "#dd0000" : "#000000";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.closePath();
        context.stroke();

        context.restore();
    }

    public remove(): void {
        this.wireStart?.setWire(null);
        this.wireEnd?.setWire(null);
    }
}

abstract class CircuitComponent {

    protected inputSockets: Socket[];
    protected outputSockets: Socket[];

    protected x: number;
    protected y: number;

    protected componentId: number;
    private id: number;

    protected hovered: boolean;
    
    private uncomputed: boolean = false;

    public constructor(x: number, y: number, componentId: number, id: number) {
        this.inputSockets = [];
        this.outputSockets = [];

        this.x = x;
        this.y = y;

        this.componentId = componentId;
        this.id = id;

        this.hovered = false;
    }

    public render(view: View): void {
        const ctx = view.getDrawingContext();

        const realX = this.x + view.getScrollX();
        const realY = this.y + view.getScrollY();

        const width = 64;
        const height = 64;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(Circuit.images[this.componentId], realX, realY, width, height);


        this.inputSockets.forEach((s) => s.render(view, realX, realY));
        this.outputSockets.forEach((s) => s.render(view, realX, realY));

        //this.inputSockets.forEach((s, i) => s.render(view, realX + 7, realY + 7 + (height - 14)/(this.inputSockets.length + 1) * (i + 1)));
        //this.outputSockets.forEach((s, i) => s.render(view, realX + width - 7, realY + 7 + (height - 14)/(this.outputSockets.length + 1) * (i + 1)));

        if(this.hovered) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#ff0000";
            ctx.globalCompositeOperation = "multiply";
            ctx.fillRect(realX, realY, width, height);
            ctx.restore();
        }
    }

    public getInputSockets(): Socket[] {
        return this.inputSockets;
    }

    public getOutputSockets(): Socket[] {
        return this.outputSockets;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public setX(x: number): void {
        this.x = x;
    }

    public setY(y: number): void {
        this.y = y;
    }

    public move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }

    public getWidth(): number {
        return 64;
    }

    public getHeight(): number {
        return 64;
    }

    public socketAt(x: number, y: number): Socket[] {
        const sx = x - this.x;
        const sy = y - this.y;
        
        const inputs = this.inputSockets.filter((socket) => socket.getX() - 8 < sx && socket.getY() - 8 < sy && socket.getX() + 8 > sx && socket.getY() + 8 > sy);
        const outputs = this.outputSockets.filter((socket) => socket.getX() - 8 < sx && socket.getY() - 8 < sy && socket.getX() + 8 > sx && socket.getY() + 8 > sy);
        return inputs.concat(outputs);
    }

    public setHovered(hovered: boolean): void {
        this.hovered = hovered;
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getComponentId(): number {
        return this.componentId;
    }

    public getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        throw "Operation not implemented";
    }

    public getClassicalOutput(inputs: number[]): boolean[] {
        throw "Operation not implemented";
    }

    public checkCollision(x: number, y: number): boolean {
        return x > this.x && y > this.y && x < this.x + this.getWidth() && y < this.y + this.getHeight();
    }

    public checkComponentCollision(x: number, y: number): boolean {
        return this.checkCollision(x, y);
    }

    public serialize(): { [key: string]: string | number | boolean | { [key: number]: string }} {
        const dict: { [key: string]: string | number | boolean | { [key: number]: string }} = {};

        //basic data
        dict["x"] = this.x;
        dict["y"] = this.y;
        dict["componentId"] = this.componentId;
        dict["id"] = this.id;

        //sockets & wires
        const inputLinks: { [key: number]: string } = {};
        this.inputSockets.forEach((socket) => inputLinks[socket.getSocketIndex()] = socket.getWire() != null ? socket.getWire()?.getWireStart().getOwner().getId() + "." + socket.getWire()?.getWireStart().getSocketIndex() : "");
        const outputLinks: { [key: number]: string } = {};
        this.outputSockets.forEach((socket) => outputLinks[socket.getSocketIndex()] = socket.getWire() != null ? socket.getWire()?.getWireEnd().getOwner().getId() + "." + socket.getWire()?.getWireEnd().getSocketIndex() : "");
        dict["inputs"] = inputLinks;
        dict["outputs"] = outputLinks;

        //subclass data
        const data = this.getSerializableData();
        Object.keys(data).forEach((key) => dict[key] = data[key]);

        return dict;
    }

    protected getSerializableData(): { [key: string]: string | number | boolean } { return { }; }

    public fromEncoding(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}, circuit: Circuit): boolean {
        
        //basic data
        const x = encoding["x"] as number;
        const y = encoding["y"] as number;
        if(!circuit.canAdd(x, y, this) && encoding["componentId"] as number != 30)
            return false;
        this.x = x;
        this.y = y;

        const id = encoding["id"] as number;
        const other = circuit.getComponent(id);
        if(other != undefined && other != this)
            return false;
        this.id = encoding["id"] as number;

        //sockets & wires
        const inputs = encoding["inputs"] as { [key: number]: string };
        const outputs = encoding["outputs"] as { [key: number]: string };
        Object.keys(inputs).forEach((key) => {
            const socketIndex = parseInt(key)
            const val = inputs[socketIndex];
            if(val == "")
                return;
            const parts = val.split(".");
            const otherId = parseInt(parts[0]);
            const otherSocketIndex = parseInt(parts[1]);

            const other = circuit.getComponent(otherId);
            if(other == undefined)
                return;
            const otherSocket = other.getOutputSocket(otherSocketIndex);
            if(otherSocket == undefined)
                return;
            const thisSocket = this.getInputSocket(socketIndex);
            if(thisSocket == undefined)
                return;

            circuit.wireSockets(otherSocket, thisSocket);          
        });
        Object.keys(outputs).forEach((key) => {
            const socketIndex = parseInt(key)
            const val = outputs[socketIndex];
            if(val == "")
                return;
            const parts = val.split(".");
            const otherId = parseInt(parts[0]);
            const otherSocketIndex = parseInt(parts[1]);

            const other = circuit.getComponent(otherId);
            if(other == undefined)
                return;
            const otherSocket = other.getInputSocket(otherSocketIndex);
            if(otherSocket == undefined)
                return;
            const thisSocket = this.getOutputSocket(socketIndex);
            if(thisSocket == undefined)
                return;

            circuit.wireSockets(thisSocket, otherSocket);          
        });

        //subclass data
        this.setSerializableData(encoding);
        return true;
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  }

    public getOutputSocket(index: number): Socket | undefined {
        return this.outputSockets.find((socket) => socket.getSocketIndex() == index);
    }

    public getInputSocket(index: number): Socket | undefined {
        return this.inputSockets.find((socket) => socket.getSocketIndex() == index);
    }

    public setUncomputed(value: boolean): void {
        this.uncomputed = value;
    }

    public isUncomputed(): boolean {
        return this.uncomputed;
    }
}

class ClassicalSourceComponent extends CircuitComponent {

    private on: boolean = false;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 0, id);

        this.outputSockets.push(new Socket(64 - 7, 32, 0, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [this.on];
    }

    public isOn(): boolean {
        return this.on;
    }

    public setOn(on: boolean): void {
        this.on = on;
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "on": this.on };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {
        this.on = encoding["on"] as boolean;
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();
        ctx.save();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.fillStyle = this.on ? "#00ff00" : "#444444";

        const centerX = this.x + view.getScrollX() + this.getWidth() / 2;
        const centerY = this.y + view.getScrollY() + this.getHeight() / 2;
        const radius = 7;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
}

class ClassicalSinkComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 2, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [];
    }
}

class QuantumSourceComponent extends CircuitComponent {

    private zeroCoefficient: number = 1;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 1, id);

        this.outputSockets.push(new Socket(64 - 7, 32, 0, false, true, this));
    }

    public setZeroCoefficient(num: number): void {
        this.zeroCoefficient = num;
    }

    public getZeroCoefficient(): number {
        return this.zeroCoefficient;
    }

    public getOneCoefficient(): number {
        return Math.sqrt(1 - this.getZeroCoefficient() * this.getZeroCoefficient());
    }

    public toVector(): Vector {
        return new Vector(2, false, [this.getZeroCoefficient(), this.getOneCoefficient()]);
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "zeroCoefficient": this.zeroCoefficient };
    }

    protected override setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string } }): void {
        this.zeroCoefficient = encoding["zeroCoefficient"] as number;
    }

    public override render(view: View): void {
        super.render(view);

        const startX = 10 + this.x + view.getScrollX();
        const startY = 32 + this.y - 5 + view.getScrollY();
        const w = 44;
        const h = 10;
        const firstPart = w * this.zeroCoefficient * this.zeroCoefficient;

        const ctx = view.getDrawingContext();
        ctx.save();
        ctx.fillStyle = "#5050ff";
        ctx.fillRect(startX, startY, firstPart, h);
        
        ctx.fillStyle = "#50cf00";
        ctx.fillRect(startX + firstPart, startY, w - firstPart, h);
        ctx.restore();

        this.getOutputSockets()[0].render(view, this.x + view.getScrollX(), this.y + view.getScrollY());
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [this.getZeroCoefficient(), 0],
            [this.getOneCoefficient(), 0]
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class QuantumSinkComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 3, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        return Matrix.makeIdentity(2**numQubits);
    }
}

class ClassicalMeasureComponent extends CircuitComponent {

    private result: boolean = false;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 17, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        this.result = inputs[0] >= 1;
        return [this.result];
    }

    public getResult(): boolean {
        return this.result;
    }

    public setResult(result: boolean): void {
        this.result = result;
    }

    public override render(view: View): void {

        const ctx = view.getDrawingContext();
        ctx.save();
        ctx.fillStyle = this.result ? "#50cf00" : "#888888";

        const startX = this.x + view.getScrollX() + 12;
        const startY = this.y + view.getScrollY() + 25;
        const width = 43;
        const height = 18;

        ctx.fillRect(startX, startY, width, height);
        ctx.restore();

        super.render(view);
    }
}

class QuantumMeasureComponent extends CircuitComponent {

    private buckets: number[] = [ 0.3, 0.2, 0.4, 0.1 ];
    private oneRate: number = 0;
    private measureGroup: number = 0;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 18, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, true, this));
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1]
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }

    public getBuckets(): number[] {
        return this.buckets;
    }

    public getMeasureGroup(): number {
        return this.measureGroup;
    }

    public setBuckets(buckets: number[]): void {
        this.buckets = buckets;
    }

    public setMeasureGroup(group: number): void {
        this.measureGroup = group;
    }

    public setOneRate(rate: number): void {
        this.oneRate = rate;
    }

    public getOneRate(): number {
        return this.oneRate;
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "measureGroup": this.measureGroup };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.measureGroup = encoding["measureGroup"] as number;
    }

    public override render(view: View): void {

        const ctx = view.getDrawingContext();
        ctx.save();
        
        const startX = this.x + view.getScrollX() + 12;
        const startY = this.y + view.getScrollY() + 25;
        const width = 40;
        const height = 18;

        const zeroPart = width * (1 - this.oneRate);

        const colours = this.getMeasureGroup() == 1 ? ["#2d85c5", "#61bdee"]
            : this.getMeasureGroup() == 2 ? ["#fe3902", "#ffb403"]
            : this.getMeasureGroup() == 3 ? ["#48a88c", "#aadea7"]
            : ["#666666", "#aaaaaa"]

        ctx.fillStyle = colours[0]; 
        ctx.fillRect(startX, startY, zeroPart, height);
        
        ctx.fillStyle = colours[1];
        ctx.fillRect(startX + zeroPart, startY, width - zeroPart, height);

        ctx.restore();

        super.render(view);
    }

}

class SingleQubitCircuitComponent extends CircuitComponent {

    public constructor(x: number, y: number, componentId: number, id: number) {
        super(x, y, componentId, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, true, this));
    }

    public override render(view: View): void {
        super.render(view); 
    }

}

class PauliXComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 11, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [0, 1],
            [1, 0]
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);        
    }
}

class PauliYComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 12, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [0, -1], //TODO -i
            [1, 0]  //TODO i
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class PauliZComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 13, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1, 0],
            [0, -1] 
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class PauliHComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 14, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1/(2**0.5), 1/(2**0.5)],
            [1/(2**0.5), -1/(2**0.5)]
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class PauliSComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 15, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO i
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class PauliTComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 16, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO e^ipi/4
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }
}

class RComponent extends SingleQubitCircuitComponent {

    private piCoefficient = 0;
    private constant = 0;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 25, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx = qubitIndices[0];
        const matrixLeft = Matrix.makeIdentity(2**idx);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx - 1));

        const componentMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO e^ipitheta
        ]);

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight); 
    }

    public setPiCoefficient(value: number): void {
        this.piCoefficient = value;
    }

    public setConstant(value: number): void {
        this.constant = value;
    }

    public getPiCoefficient(): number {
        return this.piCoefficient;
    }

    public getConstant(): number {
        return this.constant;
    }
}

class ControlledCircuitComponent extends CircuitComponent {

    public constructor(x: number, y: number, componentId: number, id: number) {
        super(x, y, componentId, id);

        this.inputSockets.push(new Socket(32, 7, 0, true, true, this));
        this.inputSockets.push(new Socket(7, 32, 1, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 16, 2, false, true, this));
        this.outputSockets.push(new Socket(64 - 7, 48, 3, false, true, this));
    }

    public override render(view: View): void {
        super.render(view); 
    }

}

class ControlledXComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 19, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [0, 1], 
            [1, 0]
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.
            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.
            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }

}

class ControlledYComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 20, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [0, -1], //TODO -i
            [1, 0]  //TODO i
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }
}

class ControlledZComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 21, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [1, 0], //TODO -i
            [0, -1]  //TODO i
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }

    
}

class ControlledHComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 22, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [1/(2**0.5), 1/(2**0.5)],
            [1/(2**0.5), -1/(2**0.5)]
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }

    
}

class ControlledSComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 23, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO i
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }
}

class ControlledTComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 24, id);
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO e^ipi/4
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }
    
}
class ControlledRComponent extends ControlledCircuitComponent {

    private piCoefficient = 0;
    private constant = 0;
    
    public constructor(x: number, y: number, id: number) {
        super(x, y, 26, id);
    }

    public setPiCoefficient(value: number): void {
        this.piCoefficient = value;
    }

    public setConstant(value: number): void {
        this.constant = value;
    }

    public getPiCoefficient(): number {
        return this.piCoefficient;
    }

    public getConstant(): number {
        return this.constant;
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { 
            "piCoefficient": this.piCoefficient,
            "constant": this.constant
        };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.piCoefficient = encoding["piCoefficient"] as number;
        this.constant = encoding["constant"] as number;
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);

        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));

        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = Matrix.makeIdentity(size);

        const actionMatrix = Matrix.fromArray([
            [1, 0],
            [0, 1] //TODO e^ipitheta
        ]);

        if(qubitIndices[0] < qubitIndices[1]) { //|10><11| etc.

            const actionPart = Matrix.makeIdentity(size / 2).tensorProduct(actionMatrix);

            for(let i = size/2; i < size; i++) {
                componentMatrix.set(i, i, 0);
                for(let j = size/2; j < size; j++) {
                    componentMatrix.set(i, j, actionPart.get(i - size/2, j - size / 2));
                }
            }
        }
        else { //|01><11| etc.

            const actionPart = actionMatrix.tensorProduct(Matrix.makeIdentity(size / 2));

            for(let i = 1; i < size; i += 2) {
                componentMatrix.set(i, i, 0);
                for(let j = 0; j < size/2; j++) {
                    componentMatrix.set(i, j * 2 + 1, actionPart.get((i - 1)/2, j))
                }
            }
        }



        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           

    }
}

class QuantumSwapComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 28, id);

        this.inputSockets.push(new Socket(7, 18, 0, true, true, this));
        this.inputSockets.push(new Socket(7, 46, 1, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 18, 2, false, true, this));
        this.outputSockets.push(new Socket(64 - 7, 46, 3, false, true, this));
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx2 = Math.max(...qubitIndices);
    
        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx2 - 1));
    
        const size = 2**(idx2 - idx1 + 1);
        const componentMatrix = new Matrix(size, size);
    
        for(let i = 0; i < size; i++) {
            if(i % 2 == 0 && i < size / 2) { //|0x0>
                componentMatrix.set(i, i, 1);
            }
            else if(i % 2 == 1 && i >= size / 2) { //|1x1>
                componentMatrix.set(i, i, 1);
            }
            else {
                if(i % 2 == 0) {
                    componentMatrix.set(i, i - size / 2 + 1, 1); //|1x0> --> |0x1>
                }
                else {                                           //|0x1> --> |1x0>
                    componentMatrix.set(i, i + size / 2 - 1, 1);
                }
            }
        }

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           
    
    }

}

class CCNOTComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 33, id);

        this.inputSockets.push(new Socket(18, 7, 0, true, true, this));
        this.inputSockets.push(new Socket(46, 7, 1, true, true, this));
        this.inputSockets.push(new Socket(7, 32, 2, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 16, 3, false, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 4, false, true, this));
        this.outputSockets.push(new Socket(64 - 7, 48, 5, false, true, this));
    }

    public override render(view: View): void {
        super.render(view); 
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        const idx1 = Math.min(...qubitIndices);
        const idx3 = Math.max(...qubitIndices);
        let idx2 = qubitIndices[0];
        for(let i = 1; i < 3; i++) {
            if(qubitIndices[i] != idx1 && qubitIndices[i] != idx3)
                idx2 = qubitIndices[i];
        }
    
        const matrixLeft = Matrix.makeIdentity(2**idx1);
        const matrixRight = Matrix.makeIdentity(2**(numQubits - idx3 - 1));
    
        const size = 2**(idx3 - idx1 + 1);
        const componentMatrix = new Matrix(size, size);

        const controlBit3 = 1;
        const controlBit2 = 2 ** (idx2 - idx1);
        const controlBit1 = 2 ** (idx3 - idx1);
    
        for(let i = 0; i < size; i++) {
            componentMatrix.set(i, i, 1);
            if((i & controlBit1) > 0 && (i & controlBit2)) {
                componentMatrix.set(i, i, 0);
                if((i & controlBit3) > 0) {
                    componentMatrix.set(i, i - controlBit3, 1);
                }
                else {
                    componentMatrix.set(i, i + controlBit3, 1);
                }
            }
        }

        return matrixLeft.tensorProduct(componentMatrix).tensorProduct(matrixRight);           
    
    }

}

class ClassicalPipeComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 31, id);

        this.inputSockets.push(new Socket(12, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64 - 12, 32, 1, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] >= 1];
    }
}

class QuantumPipeComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 32, id);

        this.inputSockets.push(new Socket(12, 32, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 12, 32, 1, false, true, this));
    }

    public override getUnitary(classicalInputs: boolean[], numQubits: number, qubitIndices: number[]): Matrix {
        return Matrix.makeIdentity(2**numQubits);
    }
}

class TextComponent extends CircuitComponent {

    private text: string = "";
    private width: number = 64;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 29, id);
    }

    public getText(): string {
        return this.text;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public override getWidth(): number {
        return this.width;
    }

    public override render(view: View): void {

        const realX = this.x + view.getScrollX();
        const realY = this.y + view.getScrollY();

        const ctx = view.getDrawingContext();
        ctx.save();

        ctx.font = "25px Courier";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        const w = Math.max(64, ctx.measureText(this.text).width + 10);
        this.width = w;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(realX, realY + 16, w, 36);
        ctx.strokeRect(realX, realY + 16, w, 36);
        
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "middle";

        ctx.fillText(this.text, realX + 5, realY + 16 + 18);

        if(this.hovered) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#ff0000";
            ctx.globalCompositeOperation = "multiply";
            ctx.fillRect(realX, realY + 16, w, 36);
            ctx.restore();
        }

        ctx.restore();
    }

    public override checkCollision(x: number, y: number): boolean {
        return x > this.x && y > this.y + 16 && x < this.x + this.getWidth() && y < this.y + 16 + 36;
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "text": this.text };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.text = encoding["text"] as string;
    }

}

class AreaComponent extends CircuitComponent {

    private colourId: number = 0;
    private width: number;
    private height: number;

    private static colours: string[] = [
        "",
        "#ff000033",
        "#00ff0033",
        "#0000ff33",
        "#ff00ff33",
        "#ffff0033",
        "#00ffff33",
        "#7f000033",
        "#007f0033",
        "#00007f33",
        "#7f007f33",
        "#7f7f0033",
        "#007f7f33",
        "#007f3f33",
        "#00000033",
    ];

    public constructor(x: number, y: number, width: number, height: number, id: number) {
        super(x, y, 30, id);
        this.width = width;
        this.height = height;
    }

    public getColourId(): number {
        return this.colourId;
    }

    public setColourId(value: number): void {
        this.colourId = value;
    }

    public override render(view: View): void {
        const realX = this.x + view.getScrollX();
        const realY = this.y + view.getScrollY();

        const ctx = view.getDrawingContext();
        ctx.save();

        if(this.colourId != 0) {
            const colour = AreaComponent.colours[this.colourId];
            ctx.fillStyle = colour;
            ctx.fillRect(realX, realY, this.width, this.height);
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        ctx.strokeRect(realX, realY, this.width, this.height);

        if(this.hovered) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "#ff0000";
            ctx.globalCompositeOperation = "multiply";
            ctx.fillRect(realX - 5, realY - 5, this.width + 10, this.height + 10);
            ctx.restore();
        }

        ctx.restore();
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "colourId": this.colourId, "width": this.width, "height": this.height };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.colourId = encoding["colourId"] as number;
        this.width = encoding["width"] as number;
        this.height = encoding["height"] as number;
    }

    public override checkCollision(x: number, y: number): boolean {
        const borderSizeHalf = 8;

        const smallCollision = x > this.x + borderSizeHalf && y > this.y + borderSizeHalf && x < this.x + this.width - borderSizeHalf && y < this.y + this.height - borderSizeHalf;
        if(smallCollision)
            return false;
        
        return x > this.x - borderSizeHalf && y > this.y - borderSizeHalf && x < this.x + this.width + borderSizeHalf && y < this.y + this.height + borderSizeHalf;
        
    }

    public override checkComponentCollision(x: number, y: number): boolean {
        return false;
    }


}


//Classical Components
class NotComponent extends CircuitComponent {
    public constructor(x: number, y: number, id: number) {
        super(x, y, 4, id);

        this.inputSockets.push(new Socket(3, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64 - 18, 32, 1, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] == 0];
    }
}
class AndComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 5, id);

        this.inputSockets.push(new Socket(7, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(7, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] == 1 && inputs[1] == 1];
    }

}

class OrComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 6, id);

        this.inputSockets.push(new Socket(20, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(20, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] == 1 || inputs[1] == 1];
    }

}

class NandComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 7, id);

        this.inputSockets.push(new Socket(7, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(7, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [!(inputs[0] == 1 && inputs[1] == 1)];
    }

}

class NorComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 8, id);

        this.inputSockets.push(new Socket(20, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(20, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [!(inputs[0] == 1 || inputs[1] == 1)];
    }
}

class XorComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 9, id);

        this.inputSockets.push(new Socket(20, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(20, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] != inputs[1]];
    }

}

class XnorComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 10, id);

        this.inputSockets.push(new Socket(20, 18, 0, true, false, this));
        this.inputSockets.push(new Socket(20, 46, 1, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] == inputs[1]];
    }

}

class ForkComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 27, id);

        this.inputSockets.push(new Socket(0, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64, 4, 1, false, false, this));
        this.outputSockets.push(new Socket(64, 64 - 4, 2, false, false, this));
    }

    public override getClassicalOutput(inputs: number[]): boolean[] {
        return [inputs[0] == 1, inputs[0] == 1];
    }

}

class Circuit {
    public static images: HTMLImageElement[];
    public static socketImage: HTMLImageElement;
    public static hoveredSocketImage: HTMLImageElement;
    public static quantumSocketImage: HTMLImageElement;
    public static quantumHoveredSocketImage: HTMLImageElement;

    private components: CircuitComponent[];
    private nextId: number = 0;
    private paused: boolean = false;

    public constructor() {
        this.components = [];

        Circuit.socketImage = new Image(16, 16);
        Circuit.socketImage.src = "socket.png";
        Circuit.hoveredSocketImage = new Image(16, 16);
        Circuit.hoveredSocketImage.src = "socket-hover.png";
        Circuit.quantumSocketImage = new Image(16, 16);
        Circuit.quantumSocketImage.src = "socket-quantum.png";
        Circuit.quantumHoveredSocketImage = new Image(16, 16);
        Circuit.quantumHoveredSocketImage.src = "socket-hover-quantum.png";

        Circuit.images = [];
        for(let i = 0; i < 34; i++)
        {
            Circuit.images.push(new Image(64, 64));
            Circuit.images[i].src = componentTypes[i].imageName;
        }
    }

    public getComponents(): CircuitComponent[] {
        return this.components;
    }

    public canAdd(x: number, y: number, exclude: CircuitComponent | null = null): boolean {
        const width = 64;
        const height = 64;

        const corners = [
            [x + 1, y + 1],
            [x + width, y],
            [x, y + height],
            [x + width - 1, y + height - 1]
        ];

        return !this.components.some((component) => component != exclude && corners.some((c) => component.checkComponentCollision(c[0], c[1])));
    }

    public addExistingComponent(component: CircuitComponent): void {
        if(this.getComponent(component.getId()) != undefined)
            component.setId(this.getNextId());
        this.components.push(component);
        
    }

    public addComponent(x: number, y: number, componentId: number, forceId: number = -1): CircuitComponent | undefined {
        let id = forceId;
        if(id == -1)
            id = this.getNextId();
        if(!this.canAdd(x, y))
            return undefined;
        let component: CircuitComponent | null = null;
        if(componentId == 0) {
            component = new ClassicalSourceComponent(x, y, id);
        }
        if(componentId == 1) {
            component = new QuantumSourceComponent(x, y, id);
        }
        if(componentId == 2) {
            component = new ClassicalSinkComponent(x, y, id);
        }
        if(componentId == 3) {
            component = new QuantumSinkComponent(x, y, id);
        }
        if(componentId == 4) {
            component = new NotComponent(x, y, id);
        }
        if(componentId == 5) {
            component = new AndComponent(x, y, id);
        }
        if(componentId == 6) {
            component = new OrComponent(x, y, id);
        }
        if(componentId == 7) {
            component = new NandComponent(x, y, id);
        }
        if(componentId == 8) {
            component = new NorComponent(x, y, id);
        }
        if(componentId == 9) {
            component = new XorComponent(x, y, id);
        }
        if(componentId == 10) {
            component = new XnorComponent(x, y, id);
        }
        if(componentId == 11) {
            component = new PauliXComponent(x, y, id);
        }
        if(componentId == 12) {
            component = new PauliYComponent(x, y, id);
        }
        if(componentId == 13) {
            component = new PauliZComponent(x, y, id);
        }
        if(componentId == 14) {
            component = new PauliHComponent(x, y, id);
        }
        if(componentId == 15) {
            component = new PauliSComponent(x, y, id);
        }
        if(componentId == 16) {
            component = new PauliTComponent(x, y, id);
        }
        if(componentId == 17) {
            component = new ClassicalMeasureComponent(x, y, id);
        }
        if(componentId == 18) {
            component = new QuantumMeasureComponent(x, y, id);
        }
        if(componentId == 19) {
            component = new ControlledXComponent(x, y, id);
        }
        if(componentId == 20) {
            component = new ControlledYComponent(x, y, id);
        }
        if(componentId == 21) {
            component = new ControlledZComponent(x, y, id);
        }
        if(componentId == 22) {
            component = new ControlledHComponent(x, y, id);
        }
        if(componentId == 23) {
            component = new ControlledSComponent(x, y, id);
        }
        if(componentId == 24) {
            component = new ControlledTComponent(x, y, id);
        }
        if(componentId == 25) {
            component = new RComponent(x, y, id);
        }
        if(componentId == 26) {
            component = new ControlledRComponent(x, y, id);
        }
        if(componentId == 27) {
            component = new ForkComponent(x, y, id);
        }
        if(componentId == 28) {
            component = new QuantumSwapComponent(x, y, id);
        }
        if(componentId == 29) {
            component = new TextComponent(x, y, id);
        }
        if(componentId == 31) {
            component = new ClassicalPipeComponent(x, y, id);
        }
        if(componentId == 32) {
            component = new QuantumPipeComponent(x, y, id);
        }
        if(componentId == 33) {
            component = new CCNOTComponent(x, y, id);
        }

        if(component != null) {
            this.components.push(component);
            
            return component;
        }

        return undefined;
    }

    public removeComponent(component: CircuitComponent | undefined): void {
        if(component == undefined)
            return;
        component.getInputSockets().forEach((socket) => socket.getWire()?.remove());
        component.getOutputSockets().forEach((socket) => socket.getWire()?.remove());
        this.components.splice(this.components.indexOf(component), 1);
        
    }

    public wireSockets(from: Socket, to: Socket): void {
        if(from.isQuantum() != to.isQuantum() || from.isInput() == to.isInput() || from.getOwner() == to.getOwner())
            return;

        if(from.isInput()) {
            this.wireSockets(to, from);
            return;
        }

        from.getWire()?.remove();
        to.getWire()?.remove();

        const wire = new Wire(from, to);
        from.setWire(wire);
        to.setWire(wire);

        
    }

    public unwireSocket(socket: Socket): void {
        if(socket.getWire() == null)
            return;
        socket.getWire()?.remove();
    }

    public getComponent(id: number): CircuitComponent | undefined {
        return this.components.find((component) => component.getId() == id);
    }

    public serialize(): string {
        const components = this.components.map((component) => component.serialize());
        const output: { [key: string]: any } = {};
        output["components"] = components;
        return JSON.stringify(output);
    }

    public deserialize(encoding: string): void {
        this.components.length = 0;
        this.nextId = 0;
        const data = JSON.parse(encoding);
        const components = data["components"];
        components.forEach((entry: { [key: string]: string | number | { [socket: number]: string } }) => {
            let newComponent: CircuitComponent | undefined = undefined;
            if(entry["componentId"] == 30) {
                newComponent = new AreaComponent(0, 0, 1, 1, this.getNextId());
                this.addExistingComponent(newComponent);
            } else {
                newComponent = this.addComponent(0, 0, entry["componentId"] as number);
            }
            if(entry["componentId"] == 30) {
                console.log(newComponent);
            }
            if(!newComponent?.fromEncoding(entry, this)) {
                console.log("Error adding element " + entry["id"] + ": " + entry);
                this.removeComponent(newComponent);
            }
        });

        this.nextId = Math.max(...this.components.map((component) => component.getId())) + 1;
        this.run();
    }

    public getNextId(): number {
        return this.nextId++;
    }

    public isPaused(): boolean {
        return this.paused;
    }

    public setPaused(paused: boolean): void {
        this.paused = paused;
        this.run();
    }

    public getAllSubCircuits(): CircuitComponent[][] {
        const result: CircuitComponent[][] = [];
        const visited = new Set<CircuitComponent>();

        let nextGroupId = 0;

        for(const component of this.components) {
            if(visited.has(component))
                continue;
            if(component.getInputSockets().length == 0 && component.getOutputSockets().length == 0)
                continue;

            result.push([]);
            const groupId = nextGroupId++;
            

            result[groupId].push(component);
            visited.add(component);


            const toVisit = new Set<CircuitComponent>();
            for(const input of component.getInputSockets()) {
                if(input.getWire() == null)
                    continue;
                toVisit.add(input.getWire()?.getWireStart().getOwner()!);
            }
            for(const output of component.getOutputSockets()) {
                if(output.getWire() == null)
                    continue;
                toVisit.add(output.getWire()?.getWireEnd().getOwner()!);
            }

            while(toVisit.size > 0) {
                toVisit.forEach((next) => {
                    toVisit.delete(next);
                    if(visited.has(next))
                        return;
                    result[groupId].push(next);
                    visited.add(next);


                    for(const input of next.getInputSockets()) {
                        if(input.getWire() == null || visited.has(input.getWire()?.getWireStart().getOwner()!))
                            continue;
                        toVisit.add(input.getWire()?.getWireStart().getOwner()!);
                    }
                    for(const output of next.getOutputSockets()) {
                        if(output.getWire() == null || visited.has(output.getWire()?.getWireEnd().getOwner()!))
                            continue;
                        toVisit.add(output.getWire()?.getWireEnd().getOwner()!);
                    }
                });
            }
        }

        return result;
    }

    public run(): void {
        if(this.paused)
            return;
        new Simulator().simulate(this);
    }
}

export { Socket, Wire, CircuitComponent, Circuit, ClassicalSourceComponent, QuantumSourceComponent, ClassicalMeasureComponent, QuantumMeasureComponent, RComponent, ControlledRComponent, TextComponent, AreaComponent }