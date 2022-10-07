import { View } from "./View";
import { componentTypes} from "../model/ComponentTypes"

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
        ctx.drawImage(this.hovered || this.selected ? Circuit.hoveredSocketImage : Circuit.socketImage, x + this.x - width / 2, y + this.y - height / 2, width, height);
    
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

        context.strokeStyle = "#000000";
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

    public getComponentId(): number {
        return this.componentId;
    }

    public getUnitary(): number[][] {
        throw "Operation not implemented";
    }

    public getClassicalOutput(index: number, inputs: number[]): boolean {
        throw "Operation not implemented";
    }
}

class ClassicalSourceComponent extends CircuitComponent {

    private on: boolean = false;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 0, id);

        this.outputSockets.push(new Socket(64 - 7, 32, 0, false, false, this));
    }

    public override getClassicalOutput(index: number, inputs: number[]): boolean {
        return this.on;
    }

    public isOn(): boolean {
        return this.on;
    }

    public setOn(on: boolean): void {
        this.on = on;
    }
}

class ClassicalSinkComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 2, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, false, this));
    }
}

class QuantumSourceComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 1, id);

        this.outputSockets.push(new Socket(64 - 7, 32, 0, false, true, this));
    }
}

class QuantumSinkComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 3, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
    }
}

class ClassicalMeasureComponent extends CircuitComponent {

    private result: boolean = false;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 17, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, false, this));
    }

    public override getClassicalOutput(index: number, inputs: number[]): boolean {
        return inputs[0] >= 1;
    }

    public getResult(): boolean {
        return this.result;
    }

    public setResult(result: boolean): void {
        this.result = result;
    }
}

class QuantumMeasureComponent extends CircuitComponent {

    private buckets: number[] = [ 0.3, 0.2, 0.4, 0.1 ];
    private measureGroup: number = 1;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 18, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, true, this));
    }

    public override getUnitary(): number[][] {
        throw "Operation not implemented"; //TODO
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

    public override getUnitary(): number[][] {
        return [
            [0, 1],
            [1, 0]
        ];
    }
}

class PauliYComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 12, id);
    }

    public override getUnitary(): number[][] {
        return [
            [0, -1], //TODO -i
            [1, 0] //TODO i
        ];
    }
}

class PauliZComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 13, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, -1]
        ];
    }
}

class PauliHComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 14, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1/(2**0.5), 1/(2**0.5)],
            [1/(2**0.5), -1/(2**0.5)]
        ];
    }
}

class PauliSComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 15, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: i
        ];
    }
}

class PauliTComponent extends SingleQubitCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 16, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
    }
}




class Circuit {
    public static images: HTMLImageElement[];
    public static socketImage: HTMLImageElement;
    public static hoveredSocketImage: HTMLImageElement;

    private components: CircuitComponent[];
    private nextId: number = 0;

    public constructor() {
        this.components = [];

        Circuit.socketImage = new Image(16, 16);
        Circuit.socketImage.src = "socket.png";
        Circuit.hoveredSocketImage = new Image(16, 16);
        Circuit.hoveredSocketImage.src = "socket-hover.png";
        Circuit.images = [];
        for(let i = 0; i < 19; i++)
        {
            Circuit.images.push(new Image(64, 64));
            Circuit.images[i].src = componentTypes[i].imageName;
        }
    }

    public getComponents(): CircuitComponent[] {
        return this.components;
    }

    public canAdd(x: number, y: number): boolean {
        const width = 64;
        const height = 64;
        return !this.components.some((component) => component.getX() + component.getWidth() > x && component.getX() < x + width && component.getY() + component.getHeight() > y && component.getY() < y + height);
    }

    public addComponent(x: number, y: number, componentId: number): void {
        const id = this.nextId++;
        if(!this.canAdd(x, y))
            return;
        if(componentId == 0) {
            this.components.push(new ClassicalSourceComponent(x, y, id));
        }
        if(componentId == 1) {
            this.components.push(new QuantumSourceComponent(x, y, id));
        }
        if(componentId == 2) {
            this.components.push(new ClassicalSinkComponent(x, y, id));
        }
        if(componentId == 3) {
            this.components.push(new QuantumSinkComponent(x, y, id));
        }
        if(componentId == 11) {
            this.components.push(new PauliXComponent(x, y, id));
        }
        if(componentId == 12) {
            this.components.push(new PauliYComponent(x, y, id));
        }
        if(componentId == 13) {
            this.components.push(new PauliZComponent(x, y, id));
        }
        if(componentId == 14) {
            this.components.push(new PauliHComponent(x, y, id));
        }
        if(componentId == 15) {
            this.components.push(new PauliSComponent(x, y, id));
        }
        if(componentId == 16) {
            this.components.push(new PauliTComponent(x, y, id));
        }
        if(componentId == 17) {
            this.components.push(new ClassicalMeasureComponent(x, y, id));
        }
        if(componentId == 18) {
            this.components.push(new QuantumMeasureComponent(x, y, id));
        }
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

    public getComponent(id: number): CircuitComponent | undefined {
        return this.components.find((component) => component.getId() == id);
    }
}

export { Socket, Wire, CircuitComponent, Circuit, ClassicalSourceComponent, ClassicalMeasureComponent, QuantumMeasureComponent }