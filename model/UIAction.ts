import { CircuitComponent, Socket } from "./Circuit";
import { View } from "./View";

class UIAction {
    private actionType: number = 0;
    
    public constructor(actionType: number) {
        this.actionType = actionType;
    }

    public doUndo(view: View): void {
        view.setUpdatePaused(true);
        this.undo(view);
        view.setUpdatePaused(false);
        view.update();
    }

    public doRedo(view: View): void {
        view.setUpdatePaused(true);
        this.redo(view);
        view.setUpdatePaused(false);
        view.update();
    }

    protected undo(view: View): void { }

    protected redo(view: View): void { }
}

class PlaceComponentAction extends UIAction {
    private x: number;
    private y: number;

    private componentId: number;

    private id = -1;

    public constructor(x: number, y: number, componentId: number) {
        super(0);
        this.x = x;
        this.y = y;
        this.componentId = componentId;
    }

    protected override undo(view: View): void {
        view.removeComponent(this.id);
    }

    protected override redo(view: View): void {
        const comp = view.addComponent(this.x, this.y, this.componentId, this.id);
        this.id = comp?.getId()!;
    }
}

class EraseComponentAction extends UIAction {
    private component: CircuitComponent;

    private wires: { [key: number]: Socket } = {};

    public constructor(component: CircuitComponent) {
        super(1);
        this.component = component;
        this.component.getInputSockets().forEach((socket) => {
            if(socket.getWire()?.getWireStart() != null)
                this.wires[socket.getSocketIndex()] = socket.getWire()!.getWireStart();
        });
        this.component.getOutputSockets().forEach((socket) => {
            if(socket.getWire()?.getWireEnd() != null)
                this.wires[socket.getSocketIndex()] = socket.getWire()!.getWireEnd();
        });
    }

    protected override redo(view: View): void {
        view.removeComponent(this.component.getId());
    }

    protected override undo(view: View): void {
        view.addExistingComponent(this.component);
        Object.keys(this.wires).forEach((key) => {
            let socket = this.component.getInputSocket(parseInt(key));
            if(socket == undefined)
                socket = this.component.getOutputSocket(parseInt(key));
            if(socket == undefined)
                return;
            
            view.getCircuit().wireSockets(socket, this.wires[socket.getSocketIndex()]);
        });
    }
}

class MoveComponentAction extends UIAction {
    private component: CircuitComponent;

    private oldX: number;
    private oldY: number;

    private newX: number;
    private newY: number;

    public constructor(component: CircuitComponent, oldX: number, oldY: number) {
        super(2);
        this.component = component;
        
        this.newX = this.component.getX();
        this.newY = this.component.getY();
        this.oldX = oldX;
        this.oldY = oldY;
    }

    protected override redo(view: View): void {
        this.component.move(this.newX - this.oldX, this.newY - this.oldY);
    }

    protected override undo(view: View): void {
        this.component.move(this.oldX - this.newX, this.oldY - this.newY);
    }
}

class PlaceWireAction extends UIAction {
    private from: Socket;
    private to: Socket;

    private previous_from_to: Socket | undefined;
    private previous_to_from: Socket | undefined;

    public constructor(from: Socket, to: Socket, previous_from_to: Socket | undefined, previous_to_from: Socket | undefined) {
        super(3);
        this.from = from;
        this.to = to;
        this.previous_from_to = previous_from_to;
        this.previous_to_from = previous_to_from;
    }

    protected override redo(view: View): void {
        view.getCircuit().wireSockets(this.from, this.to);
    }

    protected override undo(view: View): void {
        view.getCircuit().unwireSocket(this.to);
        if(this.previous_from_to != undefined)
            view.getCircuit().wireSockets(this.from, this.previous_from_to);
        if(this.previous_to_from != undefined)
            view.getCircuit().wireSockets(this.to, this.previous_to_from);
    }
}

class PlaceAreaAction extends UIAction {
    private x: number;
    private y: number;
    private width: number;
    private height: number;

    private id: number = -1;

    public constructor(x: number, y: number, width: number, height: number) {
        super(4);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    protected override redo(view: View): void {
        const area = view.addArea(this.x, this.y, this.width, this.height, this.id);
        this.id = area.getId();
    }

    protected override undo(view: View): void {
        view.removeComponent(this.id);
    }
}

export { UIAction, PlaceComponentAction, EraseComponentAction, MoveComponentAction, PlaceWireAction, PlaceAreaAction };