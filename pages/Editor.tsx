import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect, Children, ReactElement, RefObject } from 'react';
import styles from '../styles/Editor.module.css';
import { View } from '../model/View';
import { CircuitComponent } from './CircuitComponent';
import { ComponentType } from '../model/ComponentTypes';
import { UtensilBar } from './UtensilBar';

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
    private view: View | null = null;
    private dragging: CircuitComponent | null = null;
    private wasDragging: boolean = false;


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
            this.addComponent((clientX - 32) * window.devicePixelRatio - this.view?.getScrollX()!, (clientY - 32) * window.devicePixelRatio - this.view?.getScrollY()!, this.state.selectedComponent);
        } else {
            if (this.view?.clickedDetails(originalClientX * window.devicePixelRatio, originalClientY * window.devicePixelRatio)) {
                //NO-OP
            }
            else if (this.props.utensils.current?.state.scroll) {
                const sockets = this.view?.socketsAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
                if (sockets?.length! > 0) {
                    this.view?.selectSocket(sockets![0]);
                }
                else {
                    this.view?.selectSocket(null);
                    if(!this.wasDragging)
                        this.view?.openDetails(this.view.componentAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!), originalClientX, originalClientY);
                }
            }
            else {
                this.view?.removeComponentAt(clientX * window.devicePixelRatio - this.view?.getScrollX()!, clientY * window.devicePixelRatio - this.view?.getScrollY()!);
            }
        }
        this.dragging = null;
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


        if (this.props.utensils.current?.state.scroll && this.dragging == null)
            this.view?.scroll(dx, dy);
        else if (this.props.utensils.current?.state.scroll) {
            if(this.props.utensils.current.state.snap) {
                const snappedPos = this.doSnap(this.dragging.getX(), this.dragging.getY());
                this.dragging.setX(snappedPos[0]);
                this.dragging.setY(snappedPos[1]);
            }
            this.dragging.move(-dx * window.devicePixelRatio, -dy * window.devicePixelRatio);
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

    addComponent(x: number, y: number, id: number) {
        this.view?.addComponent(x, y, id);
    }

    setSelectedComponent(id: number) {
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
            }
        });
    }


    render() {
        return (
            <div>
                <canvas className={styles.editor} ref={this.canvasRef} width="500px" height="500px" onMouseDown={(ev) => this.mouseDown(ev)} onMouseUp={(ev) => this.mouseUp(ev)} onMouseMove={(ev) => this.mouseMove(ev)}></canvas>
            </div>
        )
    }

    getView(): View | null {
        return this.view;
    }
}

export default Editor
