import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect } from 'react';
import styles from '../styles/UtensilBarItem.module.css';

type UtensilBarItemProps = {
  name: string,
  annotation?: string,
  onChange?: (value: boolean) => void,
  buttonOnly: boolean,
  float?: string,
  alternativeName?: string,
}

type UtensilBarItemState = {
  selected: boolean,
  enabled: boolean
}

class UtensilBarItem extends Component<UtensilBarItemProps, UtensilBarItemState> {

  state: UtensilBarItemState = {
    selected: false,
    enabled: true
  }


  click() {
    if(this.props.buttonOnly) {
      this.props.onChange?.call(null, true);
      return;
    }

    const newVal = !this.state.selected;
    this.setState((state) => ({
      selected: newVal,
      enabled: state.enabled
    }));
    this.props.onChange?.call(null, newVal);
  }

  reset() {
    this.setState((state) => ({
      selected: false,
      enabled: state.enabled
    }));
  }

  set(selected: boolean, propagate: boolean = true) {
    this.setState((state) => ({
      selected: selected,
      enabled: state.enabled
    }));
    if(propagate) {
      this.props.onChange?.call(null, selected);
    }
  }

  render() {
    return (
      <div className={(this.state.selected ? styles.selectedItem : styles.unselectedItem) + " " + (this.props.float == "right" ? styles.floatRight : "")} onClick={() => this.click()}>
        <img src={"utensils/" + (this.state.selected ? (this.props.alternativeName != null ? this.props.alternativeName : this.props.name) : this.props.name) + ".png"} className={styles.icon} title={(this.state.selected ? (this.props.alternativeName != null ? this.props.alternativeName : this.props.name) : this.props.name) + (this.props.annotation != null ? " [" + this.props.annotation + "]" : "")}/>
        <div className={!this.state.enabled ? styles.disabledOverlay : styles.noDisabledOverlay}></div>
      </div>
    )
  }

  public setEnabled(enabled: boolean): void {
    this.setState((state) => ({
      selected: state.selected,
      enabled: enabled
    }));
  }
}

export { UtensilBarItem }
