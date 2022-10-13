import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect, Children, ReactElement, RefObject } from 'react';
import styles from '../styles/Editor.module.css';
import { View } from '../model/View';
import { CircuitComponent } from '../model/Circuit';
import { ComponentType } from '../model/ComponentTypes';
import { UtensilBar } from './UtensilBar';
import { LoadFile } from './LoadFile';
import { UIAction, PlaceComponentAction, EraseComponentAction, MoveComponentAction, PlaceWireAction, PlaceAreaAction } from '../model/UIAction';
import { Simulator } from '../model/Simulator';

type ComponentEntry = {
    x: number;
    y: number;
    id: number
}

type EditorProps = {
    utensils: RefObject<UtensilBar>
}

type EditorState = {
    mouseX: number;
    mouseY: number;
    selectedComponent: number;
}

class Editor extends Component<EditorProps, EditorState> {

    private canvasRef = createRef<HTMLCanvasElement>();
    private loadFileRef = createRef<LoadFile>();
    private view: View | null = null;
    private dragging: CircuitComponent | undefined = undefined;
    private wasDragging: boolean = false;
    private draggingStart: number[] = [-1, -1];

    private undoStack: UIAction[] = [];
    private redoStack: UIAction[] = [];

    state: EditorState = {
        mouseX: -1,
        mouseY: -1,
        selectedComponent: -1
    }

    mouseDown(ev: MouseEvent<HTMLCanvasElement>) {
        const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect();
        const clientX = ev.clientX - rect.x;
        const clientY = ev.clientY - rect.y;

        this.dragging = this.view?.componentAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
        if(this.dragging?.getComponentId() == 30)
            this.dragging = undefined;
        if(this.dragging != undefined) {
            this.draggingStart = [this.dragging.getX(), this.dragging.getY()];
        }
        this.setState((state) => ({
            mouseX: -2,
            mouseY: -2,
            selectedComponent: state.selectedComponent
        }));
    }

    mouseUp(ev: MouseEvent<HTMLCanvasElement>) {
        
        const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect();
        
        const originalClientX = ev.clientX - rect.x;
        const originalClientY = ev.clientY - rect.y;
        
        const newPosition = this.doSnap(originalClientX, originalClientY);
        
        const clientX = newPosition[0];
        const clientY = newPosition[1];
        
        if (this.state.selectedComponent != -1) {
            if(this.state.selectedComponent != 30)
                this.addComponent((clientX - 32) * window.devicePixelRatio - this.view?.getScrollX()!, (clientY - 32) * window.devicePixelRatio - this.view?.getScrollY()!, this.state.selectedComponent);
            else {
                if(!this.view?.isPlacingArea()) {
                    this.view?.setPlacingArea(true);
                    this.view?.setPlacingAreaStart([clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!]);
                }
                else {
                    this.addArea(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
                    this.view.setPlacingArea(false);
                }
            }
        } else {
            if (this.view?.clickedDetails(originalClientX * window.devicePixelRatio, originalClientY * window.devicePixelRatio)) {
                //NO-OP
            }
            else if (this.props.utensils.current?.state.scroll) {
                const sockets = this.view?.socketsAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
                if (sockets?.length! > 0) {
                    const previousSelect = this.view?.getSelectedSocket();
                    if(previousSelect == null)
                        this.view?.selectSocket(sockets![0]);
                    else {
                        const action = new PlaceWireAction(previousSelect, sockets![0]);
                        action.doRedo(this.view!);
                        this.addAction(action);
                        this.view?.selectSocket(null);
                    }
                }
                else {
                    this.view?.selectSocket(null);
                    if(!this.wasDragging)
                        this.view?.openDetails(this.view.componentAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!), originalClientX, originalClientY);
                }
            }
            else {
                const componentToRemove = this.view?.componentAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
                if(componentToRemove != undefined) {
                    const action = new EraseComponentAction(componentToRemove);
                    action.doRedo(this.view!);
                    this.addAction(action);
                }
            }
        }
        if(this.dragging != undefined && (this.draggingStart[0] != this.dragging.getX() || this.draggingStart[1] != this.dragging.getY())) {
            const action = new MoveComponentAction(this.dragging, this.draggingStart[0], this.draggingStart[1]);
            this.addAction(action);
        }
        this.dragging = undefined;
        this.wasDragging = false;

        this.setState((state) => ({
            mouseX: -1,
            mouseY: -1,
            selectedComponent: state.selectedComponent
        }));


    }

    doSnap(x:number, y: number) {

        if(this.props.utensils.current?.state.snap) {
            const trueX = x * window.devicePixelRatio - this.view?.getScrollX()!;
            const trueY = y * window.devicePixelRatio - this.view?.getScrollY()!;
            
            x -= trueX % 22.5;
            y -= trueY % 22.5;
        }

        return [x, y]
    }

    mouseMove(ev: MouseEvent<HTMLCanvasElement>) {

        const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect();
        const originalClientX = ev.clientX - rect.x;
        const originalClientY = ev.clientY - rect.y;

        const newPosition = this.doSnap(originalClientX, originalClientY);

        const clientX = newPosition[0];
        const clientY = newPosition[1];




        this.view?.moveMouse(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);

        if (ev.button != 0)
            return;

        if (this.state.mouseX == -1)
            return;

        if (this.state.mouseX == -2) {
            this.setState((state) => ({
                mouseX: clientX,
                mouseY: clientY,
                selectedComponent: state.selectedComponent
            }))
            return;
        };

        const dx = this.state.mouseX - clientX;
        const dy = this.state.mouseY - clientY;


        if (this.props.utensils.current?.state.scroll && this.dragging == undefined)
            this.view?.scroll(dx, dy);
        else if (this.props.utensils.current?.state.scroll) {
            if(this.props.utensils.current.state.snap) {
                const snappedPos = this.doSnap(this.dragging!.getX(), this.dragging!.getY());
                this.dragging?.setX(snappedPos[0]);
                this.dragging?.setY(snappedPos[1]);
            }
            this.dragging?.move(-dx * window.devicePixelRatio, -dy * window.devicePixelRatio);
            this.wasDragging = true;
        }

        this.setState((state) => ({
            mouseX: clientX,
            mouseY: clientY,
            selectedComponent: state.selectedComponent
        }));

        this.forceUpdate();

    }

    initView() {
        this.view = new View(this.canvasRef.current!);
        this.view?.update();
    }

    addArea(x: number, y: number) {
        const placingAreaStart = this.view?.getPlacingAreaStart()!;
        const minX = Math.min(x, placingAreaStart[0]);
        const maxX = Math.max(x, placingAreaStart[0]);
        const minY = Math.min(y, placingAreaStart[1]);
        const maxY = Math.max(y, placingAreaStart[1]);

        const action = new PlaceAreaAction(minX, minY, maxX - minX, maxY - minY);
        action.doRedo(this.view!);
        this.addAction(action);
    }

    addComponent(x: number, y: number, id: number) {
        const action = new PlaceComponentAction(x, y, id);
        action.doRedo(this.view!);
        this.addAction(action);
    }

    setSelectedComponent(id: number) {
        this.view?.setPlacingArea(false);
        
        this.setState((state) => ({
            mouseX: state.mouseX,
            mouseY: state.mouseY,
            selectedComponent: id
        }));
        this.view?.setHeldComponent(id);
    }

    componentDidMount(): void {
        this.initView();
        document.addEventListener("keydown", (ev) => {
            if (ev.key == "Escape") {
                this.view?.selectSocket(null);
                this.view?.openDetails(undefined, -1, -1);
            }
            else {
                this.view?.keyDown(ev.key);
            }
        });
    }


    render() {
        return (
            <div>
                <canvas className={styles.editor} ref={this.canvasRef} width="500px" height="500px" onMouseDown={(ev) => this.mouseDown(ev)} onMouseUp={(ev) => this.mouseUp(ev)} onMouseMove={(ev) => this.mouseMove(ev)}></canvas>
                <LoadFile ref={this.loadFileRef} onUpload={(value) => this.load(value)}></LoadFile>
            </div>
        )
    }

    load(encoding: string): void {
        this.undoStack.length = 0;
        this.redoStack.length = 0;
        this.getView()?.getCircuit().deserialize(encoding);
        this.getView()?.update();
    }

    getView(): View | null {
        return this.view;
    }

    public showLoad(): void {
        this.loadFileRef.current?.show();
    }

    public undo(): void {
        if(this.undoStack.length == 0)
            return;
        const action = this.undoStack.pop()!;
        action.doUndo(this.view!);
        this.view?.getCircuit().run();
        this.view?.update();
        this.redoStack.push(action);
        this.updateUndoRedoEnabled();
    }

    public redo(): void {
        if(this.redoStack.length == 0)
            return;
        const action = this.redoStack.pop()!;
        action.doRedo(this.view!);
        this.view?.getCircuit().run();
        this.view?.update();
        this.undoStack.push(action);
        this.updateUndoRedoEnabled();
    }

    private addAction(action: UIAction): void {
        this.view?.getCircuit().run();
        this.view?.update();
        this.undoStack.push(action);
        this.redoStack.length = 0;
        this.updateUndoRedoEnabled();
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    private updateUndoRedoEnabled() {
        this.props.utensils.current?.updateUndoRedoEnabled(this.canUndo(), this.canRedo());
    }
}

export default Editor
