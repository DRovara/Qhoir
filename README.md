<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">qwire</h3>

  <p align="center">
    quantum circuit editing tool
    <br />
    <br />
    <a href="https://github.com/DRovara/qwire">Getting Started</a>
    ·
    <a href="https://github.com/DRovara/qwire/issues">Report Bug</a>
    ·
    <a href="https://github.com/DRovara/qwire/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#running-the-project">Running the Project</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![screenshot-bell-state-full]

Qwire is a quantum circuit editing tool that allows users to construct and immediately evaluate simple quantum and classical circuits.
Qwire is built with its didactic value in mind, rather than focusing on efficiency. Using a statevector simulator in the background, it can run simple quantum algorithms accurately and supports the visualization of measurement results for further circuit inspection.

Using a large, scrollable workspace, the user can construct multiple quantum circuits next to each other to compare their outputs, and quickly extend any constructed circuits. For small problem instances, the simulator is called in real-time with any change made to the environment, so that new results are immediately observable.

In addition to more than 20 functional circuit components, qwire also supports several of UI components that can be used to organize and document complex circuits.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Typescript][typescriptlang.com]][Typescript-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started
<a name="getting-started"></a>
To get a local copy up and running follow these simple steps.

### Prerequisites

This project runs on a node.js backend. If you haven't already, please install `npm` to run it.
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/DRovara/qwire.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

After completing these steps, the node server will be ready to be run locally.

### Running the Project

You can run a development version of the project by running
```sh
    npm run dev
```

Alternatively, you can build and run qwire using
```sh
    npm run build
    npm run start
```

After running the development or release version of qwire, you can access it through your browser on `localhost:3000`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Please refer to "<a href="#getting-started">Getting Started</a>" to learn how to set up qwire and access it through your browser of choice.

After opening qwire, you will reach the main editor view. From here, click components in the toolbox on the left to select them and then place them anywhere in the workspace through an additional click.

![screenshot-half-adder]

A runnable circuit **must** include at least one classical or quantum *source component*. After placing a source component, you may set its initial state by clicking it in the circuit editor.

Components are connected to each other using wires through their _sockets_. To connect two components, first, click an _output socket_ of any component, then click an _input socket_ of any different component. Input sockets can be distinguished from output sockets by a small black dot in the middle. We further distinguish two socket types: _classical sockets_ and _quantum sockets_. Only sockets of the same type can be connected. Quantum sockets are highlighted by a slight blue tint around their edges.

![screenshot-sockets]

To observe any circuit results, connect classical or quantum _measurement components_ to your circuit. Classical measurement components will light up in green if their wire state is _ON_, otherwise, they will remain grey.

Quantum measurement components indicate the probability of $|0\rangle$ and $|1\rangle$ in the measurement result of the current qubit. By clicking a measurement, you can open a detailed result view, where you can assign the measurement to the "blue", "red", or "green" measurement group. Measurements of the same group will always be taken together. Following the basic rules of quantum information, these measurements will impact each other. The graph inside the measurement result details will also adapt to show the probabilities of all possible quantum states for the current system. 

![screenshot-measurement]

Constructed circuits may be stored on your local device by pressing the "save" button in the toolbar above the editor. The circuits are stored in a `.json` format and may be loaded again in the future. 

![screenshot-rtheta]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Circuit Export
    - [ ] OpenQASM
    - [ ] qiskit
    - [ ] Q#


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/DRovara/qwire](https://github.com/DRovara/qwire)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- Links -->
## Further Documentation

* [Getting Started with qwire](doc/getting-started/)
* [qwire Editor Documentation](doc/documentation/)
* [Sample Circuits](doc/samples/)
* [qiskit Textbook on Quantum Computing](https://qiskit.org/textbook/preface.html)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/DRovara/qwire.svg?style=for-the-badge
[contributors-url]: https://github.com/DRovara/qwire/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/DRovara/qwire.svg?style=for-the-badge
[forks-url]: https://github.com/DRovara/qwire/network/members
[stars-shield]: https://img.shields.io/github/stars/DRovara/qwire.svg?style=for-the-badge
[stars-url]: https://github.com/DRovara/qwire/stargazers
[issues-shield]: https://img.shields.io/github/issues/DRovara/qwire.svg?style=for-the-badge
[issues-url]: https://github.com/DRovara/qwire/issues
[license-shield]: https://img.shields.io/github/license/DRovara/qwire.svg?style=for-the-badge
[license-url]: https://github.com/DRovara/qwire/blob/master/LICENSE.txt

<!-- Screenshots -->
[screenshot-bell-state-full]: images/bell-state-tool.png
[screenshot-bell-state]: images/bell-state.png
[screenshot-half-adder]: images/half-adder.png
[screenshot-measurement]: images/measurement.png
[screenshot-rtheta]: images/rtheta.png
[screenshot-sockets]: images/sockets.png


[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[typescriptlang.com]: https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=blue
[Typescript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 