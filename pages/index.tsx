import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { createRef, useRef } from 'react'
import styles from '../styles/Home.module.css'
import Editor from './Editor'
import Toolbox from './Toolbox'
import UtensilBar from './UtensilBar'

const Home: NextPage = () => {

  const editor = createRef<Editor>();
  const toolbox = createRef<Toolbox>();
  const utensilBar = createRef<UtensilBar>();

  return (
    <div id="container">
      <Head>
        <title>Qhoir</title>
        <meta name="description" content="A quantum circuit editor." />
        <link rel="icon" href="favicon.png" />
      </Head>
      <UtensilBar ref={utensilBar} editor={editor} toolbox={toolbox}></UtensilBar>
      <div className={styles.contents}>
        <Editor ref={editor} utensils={utensilBar}/>
        <Toolbox ref={toolbox} onSelectionChange={(id) => { 
          editor.current?.setSelectedComponent(id);
          if(id != -1)
            utensilBar.current?.holdNothing();
          else
            utensilBar.current?.forceScroll(true);
        }}/>
      </div>
    </div>
  )
}

export default Home
