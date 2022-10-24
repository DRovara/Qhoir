import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { MouseEvent, Component, createRef, useEffect } from 'react';
import styles from '../styles/ToolboxItem.module.css';
import type { ComponentType } from '../model/ComponentTypes';
import { componentTypes } from '../model/ComponentTypes';

type ToolboxItemProps = {
  id: number,
  onChange?: (item: ToolboxItem) => void
}

type ToolboxItemState = {
  selected: boolean
}

class ToolboxItem extends Component<ToolboxItemProps, ToolboxItemState> {

  state: ToolboxItemState = {
    selected: false,
  }

  click() {
    this.setState((state) => ({
      selected: !state.selected,
    }));
    this.props.onChange?.call(null, this);
  }

  reset() {
    this.setState((state) => ({
      selected: false
    }));
  }

  render() {
    return (
      <div className={this.state.selected ? styles.selectedItem : styles.unselectedItem} onClick={() => this.click()}>
        <Image width="50px" height="50px" src={componentTypes[this.props.id]?.imageName} className={styles.icon} title={componentTypes[this.props.id]?.name} alt={componentTypes[this.props.id]?.name}/>
      </div>
    )
  }
}

export default ToolboxItem
