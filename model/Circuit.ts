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

    public checkCollision(x: number, y: number): boolean {
        return x > this.x && y > this.y && x < this.x + this.getWidth() && y < this.y + this.getHeight();
    }

    public serialize(): string {
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
        dict["outputs"] = inputLinks;

        //subclass data
        const data = this.getSerializableData();
        Object.keys(data).forEach((key) => dict[key] = data[key]);

        return JSON.stringify(dict);
    }

    protected getSerializableData(): { [key: string]: string | number | boolean } { return { }; }

    public fromEncoding(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}, circuit: Circuit): boolean {
        
        //basic data
        const x = encoding["x"] as number;
        const y = encoding["y"] as number;
        if(!circuit.canAdd(x, y, this))
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

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "on": this.on };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {
        this.on = encoding["on"] as boolean;
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

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "measureGroup": this.measureGroup };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.measureGroup = encoding["measureGroup"] as number;
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

class RComponent extends SingleQubitCircuitComponent {

    private piCoefficient = 0;
    private constant = 0;

    public constructor(x: number, y: number, id: number) {
        super(x, y, 25, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
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

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
        this.inputSockets.push(new Socket(32, 7, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, true, this));
    }

    public override render(view: View): void {
        super.render(view); 
    }

}

class ControlledXComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 19, id);
    }

    public override getUnitary(): number[][] {
        return [
            [0, 1],
            [1, 0]
        ];
    }
}

class ControlledYComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 20, id);
    }

    public override getUnitary(): number[][] {
        return [
            [0, -1], //TODO -i
            [1, 0] //TODO i
        ];
    }
}

class ControlledZComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 21, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, -1]
        ];
    }
}

class ControlledHComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 22, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1/(2**0.5), 1/(2**0.5)],
            [1/(2**0.5), -1/(2**0.5)]
        ];
    }
}

class ControlledSComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 23, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: i
        ];
    }
}

class ControlledTComponent extends ControlledCircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 24, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
    }
}
class ControlledRComponent extends ControlledCircuitComponent {

    private piCoefficient = 0;
    private constant = 0;
    
    public constructor(x: number, y: number, id: number) {
        super(x, y, 26, id);
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
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
}

class QuantumSwapComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 28, id);

        this.inputSockets.push(new Socket(7, 18, 0, true, true, this));
        this.inputSockets.push(new Socket(7, 46, 0, true, true, this));
        this.inputSockets.push(new Socket(64 - 7, 18, 0, false, true, this));
        this.inputSockets.push(new Socket(64 - 7, 46, 0, false, true, this));
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
    }
}

class CCNOTComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 33, id);

        this.inputSockets.push(new Socket(7, 32, 0, true, true, this));
        this.inputSockets.push(new Socket(18, 7, 0, true, true, this));
        this.inputSockets.push(new Socket(46, 7, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 7, 32, 1, false, true, this));
    }

    public override render(view: View): void {
        super.render(view); 
    }

}

class ClassicalPipeComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 31, id);

        this.inputSockets.push(new Socket(12, 32, 0, true, false, this));
        this.outputSockets.push(new Socket(64 - 12, 32, 0, false, false, this));
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
    }
}

class QuantumPipeComponent extends CircuitComponent {

    public constructor(x: number, y: number, id: number) {
        super(x, y, 32, id);

        this.inputSockets.push(new Socket(12, 32, 0, true, true, this));
        this.outputSockets.push(new Socket(64 - 12, 32, 0, false, true, this));
    }

    public override getUnitary(): number[][] {
        return [
            [1, 0],
            [0, 1] //TODO: "e^ipi/4"
        ];
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

    public constructor(x: number, y: number, id: number) {
        super(x, y, 30, id);
        this.width = 64;
        this.height = 64;
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

        ctx.restore();
    }

    protected override getSerializableData(): { [key: string]: string | number | boolean; } {
        return { "colourId": this.colourId };
    }

    protected setSerializableData(encoding: { [key: string]: string | number | boolean | { [key: number]: string }}): void {  
        this.colourId = encoding["colourId"] as number;
    }


}


class Circuit {
    public static images: HTMLImageElement[];
    public static socketImage: HTMLImageElement;
    public static hoveredSocketImage: HTMLImageElement;

    private components: CircuitComponent[];
    private nextId: number = 0;
    private paused: boolean = false;

    public constructor() {
        this.components = [];

        Circuit.socketImage = new Image(16, 16);
        Circuit.socketImage.src = "socket.png";
        Circuit.hoveredSocketImage = new Image(16, 16);
        Circuit.hoveredSocketImage.src = "socket-hover.png";
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
        return !this.components.some((component) => component != exclude && component.getX() + component.getWidth() > x && component.getX() < x + width && component.getY() + component.getHeight() > y && component.getY() < y + height);
    }

    public addComponent(x: number, y: number, componentId: number): CircuitComponent | undefined {
        const id = this.getNextId();
        if(!this.canAdd(x, y))
            return undefined;
        if(componentId == 0) {
            const component = new ClassicalSourceComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 1) {
            const component = new QuantumSourceComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 2) {
            const component = new ClassicalSinkComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 3) {
            const component = new QuantumSinkComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 11) {
            const component = new PauliXComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 12) {
            const component = new PauliYComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 13) {
            const component = new PauliZComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 14) {
            const component = new PauliHComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 15) {
            const component = new PauliSComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 16) {
            const component = new PauliTComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 17) {
            const component = new ClassicalMeasureComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 18) {
            const component = new QuantumMeasureComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 19) {
            const component = new ControlledXComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 20) {
            const component = new ControlledYComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 21) {
            const component = new ControlledZComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 22) {
            const component = new ControlledHComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 23) {
            const component = new ControlledSComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 24) {
            const component = new ControlledTComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 25) {
            const component = new RComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 26) {
            const component = new ControlledRComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 28) {
            const component = new QuantumSwapComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 29) {
            const component = new TextComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 30) { //TODO area needs its own add method, also needs its own delete and should not support move
            const component = new AreaComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 31) {
            const component = new ClassicalPipeComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 32) {
            const component = new QuantumPipeComponent(x, y, id);
            this.components.push(component);
            return component;
        }
        if(componentId == 33) {
            const component = new CCNOTComponent(x, y, id);
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

    public getComponent(id: number): CircuitComponent | undefined {
        return this.components.find((component) => component.getId() == id);
    }

    public serialize(): string {
        const components = this.components.map((component) => component.serialize());
        return "[" + components.join(",") + "]"
    }

    public deserialize(encoding: string): void {
        this.components.length = 0;
        this.nextId = 0;
        const data = JSON.parse(encoding);
        data.forEach((entry: { [key: string]: string | number | { [socket: number]: string } }) => {
            const newComponent = this.addComponent(0, 0, entry["componentId"] as number);
            if(!newComponent?.fromEncoding(entry, this)) {
                this.removeComponent(newComponent);
            }
        });

        this.nextId = Math.max(...this.components.map((component) => component.getId())) + 1;
    }

    public getNextId(): number {
        return this.nextId++;
    }
}

export { Socket, Wire, CircuitComponent, Circuit, ClassicalSourceComponent, ClassicalMeasureComponent, QuantumMeasureComponent, RComponent, ControlledRComponent, TextComponent, AreaComponent }