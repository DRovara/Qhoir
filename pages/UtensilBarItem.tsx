import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect } from 'react';
import styles from '../styles/UtensilBarItem.module.css';

type UtensilBarItemProps = {
  name: string,
  onChange?: (value: boolean) => void
}

type UtensilBarItemState = {
  selected: boolean
}

class UtensilBarItem extends Component<UtensilBarItemProps, UtensilBarItemState> {

  state: UtensilBarItemState = {
    selected: false,
  }

  click() {
    const newVal = !this.state.selected;
    this.setState((state) => ({
      selected: !state.selected,
    }));
    this.props.onChange?.call(null, newVal);
  }

  reset() {
    this.setState((state) => ({
      selected: false
    }));
  }

  set(selected: boolean, propagate: boolean = true) {
    this.setState((state) => ({
      selected: selected
    }));
    if(propagate) {
      this.props.onChange?.call(null, selected);
    }
  }

  render() {
    return (
      <div className={this.state.selected ? styles.selectedItem : styles.unselectedItem} onClick={() => this.click()}>
        <img src={"utensils/" + this.props.name + ".png"} className={styles.icon} title={this.props.name}/>
      </div>
    )
  }
}

export { UtensilBarItem }
