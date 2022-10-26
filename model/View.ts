import { AreaComponent, Circuit, CircuitComponent, Socket } from "./Circuit";
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

    private updatePaused: boolean = false;

    private placingAreaStart: number[] = [0, 0];
    private placingArea: boolean = false;

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

    public setUpdatePaused(paused: boolean): void {
        this.updatePaused = paused;
    }

    public update(): void {
        if(this.updatePaused)
            return;
        this.getSizes()
        this.clear();

        this.drawGrid(225);

        this.circuit.getComponents().forEach((c) => {
            if(c.getComponentId() == 30) //Draw areas first (i.e. in background)
                c.render(this);
        });
        this.circuit.getComponents().forEach((c) => {
            if(c.getComponentId() != 30) //Draw areas first (i.e. in background)
                c.render(this);
        });

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

        if(this.heldComponent == 30 && this.placingArea) {
            this.context.strokeStyle = "#000000";
            this.context.lineWidth = 2;

            const minX = Math.min(this.mouseX + this.scrollX, this.placingAreaStart[0] + this.scrollX);
            const maxX = Math.max(this.mouseX + this.scrollX, this.placingAreaStart[0] + this.scrollX);
            const minY = Math.min(this.mouseY + this.scrollY, this.placingAreaStart[1] + this.scrollY);
            const maxY = Math.max(this.mouseY + this.scrollY, this.placingAreaStart[1] + this.scrollY);

            this.context.strokeRect(minX, minY, maxX - minX, maxY - minY);

            return;
        }
        
        this.context.save()
        this.context.globalAlpha = 0.6;

        if(!this.circuit.canAdd(this.mouseX - 32, this.mouseY - 32))
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

    public addArea(x: number, y: number, width: number, height: number, forceId: number = -1): AreaComponent {
        let id = forceId;
        if(id == -1)
            id = this.circuit.getNextId();
        const component = new AreaComponent(x, y, width, height, id);
        this.circuit.addExistingComponent(component);
        this.update();
        return component;
    }

    public addComponent(x: number, y: number, id: number, forceId: number = -1): CircuitComponent | undefined {
        const result = this.circuit.addComponent(x, y, id, forceId);
        this.update();
        return result;
    }

    public addExistingComponent(component: CircuitComponent) {
        this.circuit.addExistingComponent(component);
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

            component.setHovered(component.checkCollision(x, y) && this.heldComponent == -2);
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

    public removeComponent(id: number): void {
        this.circuit.removeComponent(this.circuit.getComponent(id));
        this.update();
    }

    public selectSocket(socket: Socket | null): void {
        this.selectedSocket?.setSelected(false);
        this.selectedSocket = socket;
        this.selectedSocket?.setSelected(true);
        this.update();
    }

    public getSelectedSocket(): Socket | null {
        return this.selectedSocket;
    }

    public openDetails(component: CircuitComponent | undefined, x: number, y: number): void {
        this.currentDetailsView?.close();
        this.circuit.run();
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
            this.circuit.run();
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

    public isPlacingArea(): boolean {
        return this.placingArea;
    }

    public setPlacingArea(placing: boolean): void {
        this.placingArea = placing;
    }

    public getPlacingAreaStart(): number[] {
        return this.placingAreaStart;
    }

    public setPlacingAreaStart(start: number[]): void {
        this.placingAreaStart = start;
    }
}

export { View };