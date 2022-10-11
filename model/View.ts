import { Circuit, CircuitComponent, Socket } from "./Circuit";
import { DetailsView } from "./DetailsView";

class View {
    private width: number = 0;
    private height: number = 0;

    private scrollX: number;
    private scrollY: number;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private circuit: Circuit;

    private mouseX: number = 0;
    private mouseY: number = 0;
    private heldComponent: number = -1;

    private selectedSocket: Socket | null = null;

    private currentDetailsView: DetailsView | null = null;

    public constructor(canvas: HTMLCanvasElement) {

        this.circuit = new Circuit();

        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.context.imageSmoothingEnabled = false;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let ratio = window.devicePixelRatio;
        //const ratio = 2;
        this.canvas.style.width = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.height + "px";

        canvas.width = canvas.width * ratio;
        canvas.height = canvas.height * ratio;
        //this.context.scale(ratio, ratio);

        this.getSizes();

        this.scrollX = 0;
        this.scrollY = 0;

    }

    public scroll(x: number, y: number): void {
        this.scrollX -= x;
        this.scrollY -= y;
        if(this.scrollX < -999)
            this.scrollX = -999
        if(this.scrollY < -999)
            this.scrollY = -999
        if(this.scrollX > 999)
            this.scrollX = 999
        if(this.scrollY > 999)
            this.scrollY = 999
        this.update();
    }

    public update(): void {
        this.getSizes()
        this.clear();

        this.drawGrid(225);

        this.circuit.getComponents().forEach((c) => c.render(this));

        this.currentDetailsView?.render(this);

        this.drawHUD();
        
    }

    private drawGrid(lineDist: number): void {
        const smallLineDist = lineDist / 10;

        this.context.fillStyle = "#add8e655";
        for(let i = Math.floor(- (this.scrollX / smallLineDist)) - 1; i <= this.width / smallLineDist - (this.scrollX / smallLineDist); i++) {
            this.context.fillRect(i * smallLineDist + this.scrollX, 0, 1, this.height);
        }
        for(let i = Math.floor(- (this.scrollY / smallLineDist)) - 1; i <= this.height / smallLineDist - (this.scrollY / smallLineDist); i++) {
            this.context.fillRect(0, i * smallLineDist + this.scrollY, this.width, 1);
        }

        this.context.fillStyle = "#add8e6";
        for(let i = Math.floor(- (this.scrollX / lineDist)); i <= this.width / lineDist - (this.scrollX / lineDist); i++) {
            this.context.fillRect(i * lineDist + this.scrollX, 0, 1, this.height);
        }
        for(let i = Math.floor(- (this.scrollY / lineDist)) - 1; i <= this.height / lineDist - (this.scrollY / lineDist); i++) {
            this.context.fillRect(0, i * lineDist + this.scrollY, this.width, 1);
        }
    }

    private drawHUD(): void {

        const xPos = this.width - 10 - this.width / 20;

        //X Coordinate
        this.context.fillStyle = "#00000022";
        this.context.fillRect(xPos - 2, 8, this.width / 20 + 4, this.width / 200 * 4 + 4);
        this.context.fillStyle = "#FFFEF2";
        this.context.fillRect(xPos, 10, this.width / 20, this.width / 200 * 4);
        this.context.fillStyle = "#000000";
        this.context.font = "25px Courier";
        this.context.textBaseline = "top";
        this.context.fillText("x: " + this.scrollX*-1, xPos + 5, 15);

        //Y Coordinate
        this.context.fillStyle = "#00000022";
        this.context.fillRect(xPos - 2, 10 + 3 + this.width / 200 * 4 + 4, this.width / 20 + 4, this.width / 200 * 4 + 4);
        this.context.fillStyle = "#FFFEF2";
        this.context.fillRect(xPos, 10 + 5 + this.width / 200 * 4 + 4, this.width / 20, this.width / 200 * 4);
        this.context.fillStyle = "#000000";
        this.context.font = "25px Courier";
        this.context.textBaseline = "top";
        this.context.fillText("y: " + this.scrollY*-1, xPos + 5, 15 + 5 + this.width / 200 * 4 + 4);

        //Held component
        if(this.heldComponent < 0)
            return;
        
        this.context.save()
        this.context.globalAlpha = 0.6;

        if(!this.circuit.canAdd(this.mouseX - 32, this.mouseY - 32, this.heldComponent))
        {
            this.context.globalAlpha = 0.4;
            this.context.fillStyle = "#ff0000";
            this.context.fillRect(this.mouseX + this.scrollX - 32, this.mouseY + this.scrollY - 32, 64, 64);
            this.context.globalCompositeOperation = "multiply";
        }
        this.context.drawImage(Circuit.images[this.heldComponent], this.mouseX + this.scrollX - 32, this.mouseY + this.scrollY - 32, 64, 64);

        this.context.restore();
    }

    private clear(): void {
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(0, 0, this.width, this.height);
    }

    private drawBorder(): void {
        this.context.strokeStyle = "#000000";
        this.context.strokeRect(0, 0, this.width, this.height);
    }

    private getSizes(): void {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    public getScrollX(): number {
        return this.scrollX;
    }

    public getScrollY(): number {
        return this.scrollY;
    }

    public getDrawingContext(): CanvasRenderingContext2D {
        return this.context;
    }

    public addComponent(x: number, y: number, id: number): void {
        this.circuit.addComponent(x, y, id);
        this.update();
    }

    public setHeldComponent(id: number): void {
        this.heldComponent = id;
        this.update();
    }

    public getHeldComponent(): number {
        return this.heldComponent;
    }

    public moveMouse(x: number, y: number): void {
        const gridX = x;
        const gridY = y;

        this.circuit.getComponents().forEach((component) => {
            component.getInputSockets().forEach((socket) => socket.setHovered(false));
            component.getOutputSockets().forEach((socket) => socket.setHovered(false));
            component.socketAt(gridX, gridY).forEach((socket) => socket.setHovered(true));

            component.setHovered(component.getX() < x && component.getY() < y && component.getX() + component.getWidth() > x && component.getY() + component.getHeight() > y && this.heldComponent == -2);
        });

        this.mouseX = x;
        this.mouseY = y;

        this.update();

    
    }

    public socketsAt(x: number, y: number): Socket[] {
        return this.circuit.getComponents().map((component) => component.socketAt(x, y)).flat();
    }

    public componentAt(x: number, y: number): CircuitComponent | undefined {
        return this.circuit.getComponents().find((component) => component.checkCollision(x, y));
    }

    public removeComponentAt(x: number, y: number): void {
        this.circuit.removeComponent(this.componentAt(x, y));
        this.update();
    }

    public selectSocket(socket: Socket | null): void {
        if(this.selectedSocket != null && socket != null) {
            this.circuit.wireSockets(this.selectedSocket, socket);
            this.selectedSocket?.setSelected(false);
            this.selectedSocket = null;
        } 
        else {
            this.selectedSocket?.setSelected(false);
            this.selectedSocket = socket;
            this.selectedSocket?.setSelected(true);
        }
        this.update();
    }

    public openDetails(component: CircuitComponent | undefined, x: number, y: number): void {
        this.currentDetailsView?.close();
        if(component == undefined) {
            this.currentDetailsView = null;
            this.update();
            return;
        }
        this.currentDetailsView = DetailsView.createFor(component, x, y);
        this.update();
    }

    public clickedDetails(x: number, y: number): boolean {
        if(this.currentDetailsView == null)
            return false;
        if(x >= this.currentDetailsView.getX() && x < this.currentDetailsView.getX() + this.currentDetailsView.getWidth() && y >= this.currentDetailsView.getY() && y < this.currentDetailsView.getY() + this.currentDetailsView.getHeight()) {
            this.currentDetailsView.mouseClick(x, y);
            this.update();
            return true;
        }
        return false;
    }

    public keyDown(keyCode: string): void {
        this.currentDetailsView?.keyDown(keyCode);
        if(this.currentDetailsView != null)
            this.update();
    }
    
    public getDetailsView(): DetailsView | null {
        return this.currentDetailsView;
    }

    public getCircuit(): Circuit {
        return this.circuit;
    }
}

export { View };