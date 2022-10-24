import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect, useRef, RefObject } from 'react';
import styles from '../styles/UtensilBar.module.css';
import UtensilBarItem from './UtensilBarItem';
import Editor  from './Editor'
import Toolbox from './Toolbox';

type UtensilBarProps = {
    editor: RefObject<Editor>
    toolbox: RefObject<Toolbox>
}

type UtensilBarState = {
    scroll: boolean,
    eraser: boolean,
    snap: boolean
}

class UtensilBar extends Component<UtensilBarProps, UtensilBarState> {

    state: UtensilBarState = {
        scroll: true,
        eraser: false,
        snap: false
    }

    private toolboxRef = createRef<HTMLDivElement>();
    private toggleRef = createRef<HTMLDivElement>();

    private visible = true;

    private scrollItem = createRef<UtensilBarItem>();
    private eraserItem = createRef<UtensilBarItem>();
    private snapItem = createRef<UtensilBarItem>();
    private playPauseItem = createRef<UtensilBarItem>();
    private undoItem = createRef<UtensilBarItem>();
    private redoItem = createRef<UtensilBarItem>();

    private lastKeyDown: number = 0;

    componentDidMount(): void {
        this.scrollItem.current?.set(true);
        document.addEventListener("keydown", (ev) => {
            if(ev.key == "Escape") {
                this.scrollItem.current?.set(true);
            }
            if(ev.key == "Alt" && this.props.editor.current?.getView()?.getDetailsView() == null) {
                this.snapItem.current?.set(true);
            }
            if(ev.key.toLocaleLowerCase() == "e" && this.props.editor.current?.getView()?.getDetailsView() == null) {
                this.eraserItem.current?.set(true);
            }
            if(ev.key == " ") {
                const currentTime = new Date().getTime();
                if(currentTime - this.lastKeyDown > 200) {
                    this.playPauseItem.current?.click();
                    this.lastKeyDown = currentTime;
                }
            }
            if(ev.key.toLocaleLowerCase() == "z" && ev.ctrlKey && !ev.shiftKey) {
                const currentTime = new Date().getTime();
                if(currentTime - this.lastKeyDown > 200) {
                    this.props.editor.current?.undo();
                    this.lastKeyDown = currentTime;
                }
            }
            if(ev.key.toLocaleLowerCase() == "y" && ev.ctrlKey) {
                const currentTime = new Date().getTime();
                if(currentTime - this.lastKeyDown > 200) {
                    this.props.editor.current?.redo();
                    this.lastKeyDown = currentTime;
                }
            }
            if(ev.key.toLocaleLowerCase() == "z" && ev.ctrlKey && ev.shiftKey) {
                const currentTime = new Date().getTime();
                if(currentTime - this.lastKeyDown > 200) {
                    this.props.editor.current?.redo();
                    this.lastKeyDown = currentTime;
                }
            }
        });
        document.addEventListener("keyup", (ev) => {
            if(ev.key == "Alt" && this.props.editor.current?.getView()?.getDetailsView() == null) {
                this.snapItem.current?.set(false);
            }
        });

        this.undoItem.current?.setEnabled(false);
        this.redoItem.current?.setEnabled(false);
    }

    setScroll(scroll: boolean): void {
        this.setState((state) => ({
            scroll: scroll,
            eraser: state.eraser,
            snap: state.snap
        }));
        if(scroll) {
            this.props.editor.current?.getView()?.setHeldComponent(-1);
            this.props.toolbox.current?.resetAll();
            this.eraserItem.current?.set(false, false);
        }
         if(!scroll && this.props.editor.current?.getView()?.getHeldComponent()! < 0) {
            this.scrollItem.current?.set(true, false);
        }
    }

    setEraser(eraser: boolean): void {
        if(eraser) {
            this.props.toolbox.current?.resetAll();
            this.scrollItem.current?.set(false, false);
            
            this.props.editor.current?.getView()?.setHeldComponent(-2);
            this.setState((state) => ({
                scroll: false,
                eraser: true,
                snap: state.snap
            }));
        }
        if(!eraser && this.props.editor.current?.getView()?.getHeldComponent()! < 0) {
            this.scrollItem.current?.set(true, false);
        }
    }

    setSnap(snap: boolean): void {
        this.setState((state) => ({
            scroll: state.scroll,
            eraser: state.eraser,
            snap: snap
        }));
    }

    render() {
        return (
            <div>
                <div className={styles.utensilBar}>
                    <UtensilBarItem buttonOnly={false} name="scroll" annotation="Esc" ref={this.scrollItem} onChange={(value) => this.setScroll(value)}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={false} name="eraser" annotation="e" ref={this.eraserItem} onChange={(value) => this.setEraser(value)}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={false} name="snap" annotation="Alt" ref={this.snapItem} onChange={(value) => this.setSnap(value)}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={true} name="undo" annotation="Ctrl+z" ref={this.undoItem} onChange={(_) => this.props.editor.current?.undo()}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={true} name="redo" annotation="Ctry+y" ref={this.redoItem} onChange={(_) => this.props.editor.current?.redo()}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={true} name="import" onChange={(_) => this.load()}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={true} name="save" onChange={(_) => this.save()}></UtensilBarItem>
                    <UtensilBarItem buttonOnly={false} name="pause" annotation="space" onChange={(value) => this.playPause(value)} float="right" alternativeName="play" ref={this.playPauseItem}></UtensilBarItem>
                </div>
            </div>
        )
    }

    forceScroll(scroll: boolean): void {
        this.scrollItem.current?.set(scroll, false);
    }

    holdNothing(): void {
        this.scrollItem.current?.set(false, true);
        this.eraserItem.current?.set(false, true);
    }

    load(): void {
        this.props.editor.current?.showLoad();
    }

    save(): void {
        const encoding = this.props.editor.current?.getView()?.getCircuit().serialize();

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encoding);
        element.setAttribute('download', "circuit.qw");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
    }

    playPause(value: boolean): void {
        this.props.editor.current?.getView()?.getCircuit().setPaused(value);
        this.props.editor.current?.getView()?.update();
    }

    public updateUndoRedoEnabled(undo: boolean, redo: boolean): void {
        this.undoItem.current?.setEnabled(undo);
        this.redoItem.current?.setEnabled(redo);
    }
}

export default UtensilBar
