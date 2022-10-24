import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect, useRef } from 'react';
import styles from '../styles/Toolbox.module.css';
import ToolboxItem from './ToolboxItem';
import ToolboxMenu from './ToolboxMenu';

type ToolboxProps = {
    onSelectionChange?: (item: number) => void
}

type ToolboxState = {
    currentSelection: number
}

class Toolbox extends Component<ToolboxProps, ToolboxState> {

    state: ToolboxState = {
        currentSelection: -1,
    }

    private toolboxRef = createRef<HTMLDivElement>();
    private toggleRef = createRef<HTMLDivElement>();

    private visible = true;

    private items: Array<ToolboxItem> = [];

    componentDidMount(): void {
        document.addEventListener("keydown", (ev) => {
            if(ev.key == "Escape") {
                this.resetAll();
            }
        });
    }

    toggle() {
        if(!this.visible) {
            this.toolboxRef.current?.style.setProperty("left", "0%");
            this.toggleRef.current?.style.setProperty("left", "190px");
            this.visible = true;
        }
        else {
            this.toolboxRef.current?.style.setProperty("left", "-190px");
            this.toggleRef.current?.style.setProperty("left", "0%");
            this.visible = false;
        }
    }

    resetOthers(caller: ToolboxItem) {
        this.items.forEach((val) => {
            if(val != caller)
                val?.reset();
            })
        const oldSelection = this.state.currentSelection;
        this.setState((state) => ({
            currentSelection: caller.props.id != oldSelection ? caller.props.id : -1,
        }));
        this.props.onSelectionChange?.call(this, caller.props.id != oldSelection ? caller.props.id : -1);
    }

    resetAll() {
        this.items.forEach((val) => val?.reset())
        this.setState((state) => ({
            currentSelection: -1
        }));
        this.props.onSelectionChange?.call(this, -1);
    }

    render() {
        return (
            <div>
                <div ref={this.toolboxRef} className={styles.toolbox}>
                    <ToolboxMenu title='Tools'>
                        <ToolboxItem id={0} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={1} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={2} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={3} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={17} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={18} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                    </ToolboxMenu>
                    <ToolboxMenu title='Classical Gates'>
                        <ToolboxItem id={4} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={5} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={6} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={7} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={8} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={9} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={10} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={27} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                    </ToolboxMenu>
                    <ToolboxMenu title='Single-Qubit Gates'>
                        <ToolboxItem id={11} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={12} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={13} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={14} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={15} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={16} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={25} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                    </ToolboxMenu>
                    <ToolboxMenu title='Multi-Qubit Gates'>
                        <ToolboxItem id={19} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={20} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={21} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={22} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={23} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={24} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={26} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={28} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={33} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                    </ToolboxMenu>
                    <ToolboxMenu title='UI Blocks'>
                        <ToolboxItem id={29} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={30} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={31} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                        <ToolboxItem id={32} onChange={(item) => this.resetOthers(item)} ref={(item) => this.items.push(item!)}/>
                    </ToolboxMenu>

                </div>
                <div ref={this.toggleRef} className={styles.sliderButton} onClick={() => this.toggle()}></div>
            </div>
        )
    }
}

export default Toolbox
