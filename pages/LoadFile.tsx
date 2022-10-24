import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { MouseEvent, Component, createRef, useEffect, DragEvent, ChangeEvent } from 'react';
import styles from '../styles/LoadFile.module.css';
import { componentTypes } from '../model/ComponentTypes';

type LoadFileProps = {
  onUpload?: (text: string) => void,
}

type LoadFileState = {
  loadMessage: string,
  visible: boolean
  file: File | null,
}

class LoadFile extends Component<LoadFileProps, LoadFileState> {

  private actionSpanRef = createRef<HTMLSpanElement>();
  private mainDivRef = createRef<HTMLDivElement>();
  private fileUploadRef = createRef<HTMLInputElement>();

  state: LoadFileState = {
    loadMessage: "Drop your circuit file here!",
    visible: false,
    file: null
  }

  render() {
    return (
      <div className={this.state.visible ? styles.backgroundVisible : styles.backgroundInvisible}>
        <input type="file" id="fileUpload" className={styles.fileUpload} ref={this.fileUploadRef} onChange={(ev) => this.uploadThroughClick(ev)} accept=".qw"></input>
        <div className={this.state.visible ? styles.mainVisible : styles.mainInvisible} ref={this.mainDivRef}>
          <div className={styles.dropArea} onDragOver={(event) => this.dragOver(event)} onDrop={(event) => this.drop(event)} onClick={(ev) => this.clickUpload(ev)}><span ref={this.actionSpanRef}>{this.state.loadMessage}</span></div>
          <button className={styles.cancelButton} onClick={() => this.cancelClick()}>cancel</button>
          <button className={styles.importButton} onClick={() => this.importClick()} disabled={this.state.file == null}>import</button>
        </div>
      </div>
    )
  }

  public clickUpload(ev: MouseEvent) {
    this.fileUploadRef.current?.click();
  }
  
  public show() {
    this.setState({
        loadMessage: "Drop your circuit file here!",
        visible: true,
        file: null
    });
  }

  public hide() {
    this.setState({
        loadMessage: "Drop your circuit file here!",
        visible: false,
        file: null
    });
  }

  dragOver(ev: DragEvent<HTMLDivElement>): void {
    ev.preventDefault();
  }

  uploadThroughClick(ev: ChangeEvent<HTMLInputElement>) {
    if(this.fileUploadRef.current?.files?.length == 0)
        return;
    const file = this.fileUploadRef.current?.files?.item(0);

    if(file == null || file == undefined) {
        this.show();
        return;
    }

    this.setState({
        loadMessage: "Uploaded " + file.name + ". Press 'import' to import into project!",
        visible: this.state.visible,
        file: file
    });

  }

  drop(ev: DragEvent<HTMLDivElement>): void {
    ev.preventDefault();

    let file: File | null = null;



    file = Array.from(ev.dataTransfer.files)[0];

    if(file == null)
        return;

    this.setState({
        loadMessage: "Uploaded " + file.name + ". Press 'import' to import into project!",
        visible: this.state.visible,
        file: file
    });
  }

  cancelClick() {
    this.hide();
  }

  importClick() {
    if(this.state.file == null)
        return;
    
    this.state.file.text().then((value) => {
        if(this.props.onUpload != null)
            this.props.onUpload(value);
    });

    this.hide();
  }
}

export default LoadFile
