import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { MouseEvent, Component, createRef, useEffect } from 'react';
import styles from '../styles/ToolboxMenu.module.css';

type ToolboxMenuProps = {
  title: string,
  children?: React.ReactNode
}

type ToolboxMenuState = {
}

class ToolboxMenu extends Component<ToolboxMenuProps, ToolboxMenuState> {

  state: ToolboxMenuState = {
  }

  render() {
    return (
      <div className={styles.menu}>
        <h3 className={styles.menuTitle}>{this.props.title}</h3>
        <div className={styles.divider}></div>
        <div className={styles.items}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export { ToolboxMenu }
