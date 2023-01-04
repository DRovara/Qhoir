# Getting Started with Qhoir

In this starter's guide, we will look at simple Qhoir exercises that help you get used to working with the editor. Please consider the <a href="../documentation">documentation</a> as complimentary reading on the different components Qhoir offers.

While the getting started guide tries to explain most of the core concepts from scratch, we still recommend checking out other resources on quantum computing to build a general understanding of the topic, such as <a href="https://qiskit.org/textbook/preface.html">qiskit's Textbook</a>.

All circuits constructed during this starter's guide are also provided in the <a href="../samples">samples directory</a> so you can check them out without any additional work.

If you haven't already, check out how to open Qhoir in the <a href="../../README.md">repository's README</a>, and then come back here to get started.

## 1) Our first Circuit

To get into the gist of working with Qhoir, let's start with a simple circuit as our first example.
A _circuit_ is defined by a set of _components_ that are connected through wires. A signal is generated at the circuit's source and follows the wires in order until it reaches the end. In real life, circuits appear in all your electronic devices, carrying electrical signals. 

In Qhoir's context, however, the concept of electricity does not really matter too much. The circuits are just "simulated", so exact voltages or anything like that do not play any role at all, all we care about is _ON_ (1) or _OFF_ (0). We call this a "bit".

To build our first circuit, let's start by picking a _source_ component from the toolbox on the left. To keep things simple, we will start with a _classical_ (non-quantum) source. it is the round object on the very left of the `Tools` group. (You can inspect a component's name by hovering it with your mouse).

Click the source component to pick it up, and then click anywhere on the editor to place it. A source component is responsible for the generation of a signal in the circuit, therefore, every circuit that you want to simulate **must** have at least one source component. As you can see, there is a small grey circle in the middle of the component. This circle indicates the _state_ of the signal it generates - in this case, it is set to _OFF_. By clicking the component in the editor (first press `Esc` to get rid of the source component you're still holding), you can change this value through a simple button. Try setting the source state to _ON_ and see how the circle in the component changes colour!

However, a meaningful circuit does not only require a source - you also have to do something with the source you generated. The group `Classical Gates` contains a list of components that are commonly used to work with classical bits. The simplest classical gate is the _NOT Gate_. By connecting it to a wire, we can have it "invert" the value of its bit: _ON_ becomes _OFF_ and _OFF_ becomes on. Let's try adding a NOT Gate to the circuit by clicking it in the toolbox (it's the first element of the `Classical Gates` menu) and placing it somewhere in the editor. 

Now, we only have to connect it to the source component to add it to the circuit. As you may have noticed, the source component has another small circle on its right that lights up when you move your mouse over it. This is a _socket_. As their name suggests, sockets are places that allow us to add wires. In doing so, we can connect multiple components. In particular, the socket of the source component is an _output_ socket. Output sockets are the sockets that send out bits. _Input_ sockets, on the other hand, need wires that send bits in. You can distinguish them by the black dot that input sockets have in their middle (like the left one on the NOT gate). To connect two sockets with each other, just click them, one after the other. Keep in mind, though, that you can only connect sockets of two different types (input/output). You cannot connect two input or two output sockets. Let's do that now and connect the NOT gate to our source.

The NOT gate will now do its job and invert the state of the bit sent out by the source. But how do we know that? Nothing changed? When we modify a bit through gates, we can't really see the effect it has from the outside. To do that, we first need to _measure_ the bit. This is where _measurement components_ come into play. There are two measurement components in the `Tools` group. We are interested in the one with the round edges - the _classical measurement_. Click it and add it to the editor. Then, connect it to the circuit by connecting its input socket with the NOT gate's output socket. With this, we will finally be able to see the result: If the state of the source is set to _ON_, the NOT gate will have set it to _OFF_ and therefore, the middle part of the measurement will remain grey. If the state of the source is set to _OFF_, the NOT gate will have set it to _ON_, which will make the middle part of the measurement light up. Try changing the state of the source component again, as we discussed before, and see how it affects the measurement!

## 2) Working with Classical Components: Half Adder

Qhoir also supports most of the other commonly used classical gates: AND, OR, NAND, NOR, XOR, and XNOR. With these, we already have more than enough gates for a universal set - in other words, any possible circuit can be constructed using just these few gates (in fact, even fewer than these 7 gates would already be enough).

A special component we have in Qhoir is the _Fork_. It allows us to copy the value of a bit to two different parts of a circuit. Other commonly used circuit editors actually support this feature without requiring its own component, but in Qhoir there is a reason why we don't have that - commonly known as the <a href="https://en.wikipedia.org/wiki/No-cloning_theorem">no-cloning theorem</a>. But we will learn more about that later.

We will now use these gates to construct an actual functional circuit with a clear goal in mind: The Half Adder.

The half-adder is quite an important tool in computer science: It's a fundamental component of any maths-related circuit. The half adder is a basic circuit that takes two bits as an input, adds them together using binary addition and then outputs the result as a binary number.

First of all: What's binary addition? Just like the addition we know from our decimal system (4 + 3 = 7), the binary system also has its own addition. Adding two one-digit binary numbers together is quite easy: 
$$0 + 0 = 0$$
$$1 + 0 = 1$$
$$0 + 1 = 1$$
$$1 + 1 = 10$$

The first three lines should make sense even if you know nothing about binary. $1 + 0 = 1$, simple as that. The one line that might confuse you is the last one. In binary, we only have the digits $0$ and $1$. If we want to represent a larger number, we need two digits. In particular, the number we know as $2$ is called $10$ in binary, $3$ is $11$, $4$ is $100$ etc. Knowing this, the fourth line above should make sense as well now: $1 + 1 = 2$, and as we know now, $2$ is the same as $10$, so $1 + 1 = 10$.

Now, how would we "translate" this addition task to a circuit? The two one-digit binary input numbers can each be represented by a single bit (_ON_ = 1, _OFF_ = 0). In the circuit, these can be added as two source components. If we add leading zeros to the right side of the equations where necessary ( $1 \rightarrow 01$, $0 \rightarrow 00$, etc), it can be the output of the circuits. We can define them so that our circuit ends in two wires that will be measured. The first measurement is the left digit of the result, and the second one is the right digit.

Adding all of these starting components to the circuit, one bit above the other, you should have something like this now:
[![half_adder_1]

All we are left with now is a way to apply some gates to the circuit so that the value of the input bits gets modified in a way that makes the four equations above come true. Let us start with the easier one: The first digit of the result. As we can see the first digit of the result is $0$ (_OFF_) in 3 of the four cases. The only case where it is $1$ is when both input bits are also one. Luckily, there exists a classical gate which has exactly that effect. Try to figure out which one it could be for a second. You find a quick explanation of what each of these does in the <a href="../documentation">documentation</a>.

...

Figured it out? It's the AND gate! The result of the AND gate is $1$ only if both inputs are $1$, too!. Let's add the AND gate to the circuit and connect the two inputs to our two sources and the output to the top measurement. You can now try out some different input values, and you will see that the first digit is correct for all four of the equations above.

Now, let's look at the second digit of the result. Do you see the pattern here? If both inputs are the same, then the result is $0$ ( $0 + 0 = 00$ and $1 + 1 = 10$). If they are different, the output is $1$ ( $0 + 1 = 1$ and $1 + 0 = 1$). Can you find the classical component that does exactly that?

...

It's the XOR gate! Now, we would want to add a XOR gate to the circuit by connecting it to the source components and the bottom measurement. However, if you do that, you will notice a problem: The output sockets of the sources are already in use. If you connect them with the XOR gate now, the old wires will be removed. We need to find a way to copy the values of the sources so that they can be used for both the AND and the XOR gate. This is where the _Fork_ component comes into play - it does exactly that for us.

Try picking a Fork component from the toolbox on the left (the very last element from `Classical Gates`). Add it to the editor, and then connect the output socket of one of the sources to its input. You can now use one of the output sockets of the Fork for the AND gate and one for the XOR gate. Do the same thing again, and we're all done and dusted! 

Here's what your circuit might look like after all of that:

![half_adder_2]

And that's already the fully functional half-adder! Try out some different inputs by clicking the source components, and see how the outputs light up differently (light = $1$, no light = $0$). Of course, you could add some more stuff to make the circuit look better in general.

For instance, you could add two _Sink Components (classical)_ from the `UI Blocks` group to the right of the measurements, just to remove the dangling outputs, so that one day, if you come back to this circuit, you know this was not some unfinished circuit, it was supposed to end here.

You could also add an _Area_ component around the circuit to define the boundaries of this circuit, which might be useful once you want to have multiple different circuits in one file, or even add a _Text_ component that displays "Half Adder" somewhere close to the circuit, just so you never confuse it with a Full Adder...

Speaking about full adders, here is a further exercise, if you feel up to it and want to practice your circuit skills some more: There's a reason why the half adder is only called **half** adder. If you want to perform addition on a computer, you need to be able to handle more than just one binary digit. Now, it would be cool if there was some way to have a circuit - let's call it a _full adder_ - that performs an addition with two binary digits, that can be stacked on top of itself any number of times to handle multiple input digits. The problem with that is "carrying over" during addition - something you might remember from school: If we add two numbers, let's say $34$ and $28$, we can't just add $3 + 2$ and $4 + 8$ and then call the result $512$. Since $4+8$ produces TWO digits ( $12$ ), the leftmost digit is carried over to the second addition, so that it becomes $3 + 2 + 1$ and the full result becomes $62$. The same thing has to be done in binary: A full adder needs to be able to add **three** binary digits together and produce a two-bit output like this:
$$0+0+0 = 0$$
$$0+0+1 = 1$$
$$0+1+0 = 1$$
$$0+1+1 = 10$$
$$...$$
$$1+1+1 = 11$$

If you want to, try it out! You'll find an example solution in the <a href="../samples">samples</a> directory.

## 3) Our first Quantum Circuit

You have now made quite a few classical circuits, but the main point of Qhoir is to run quantum circuits, so it is time to get started with that!

Just like a classical circuit, every quantum circuit **must** have a source - in this case, however, it is a quantum source, and behaves slightly differently. The quantum source is the second element of the `Tools` group in your toolbox. It looks like a classical source but has hard edges instead of round ones (you will find a pattern in that throughout Qhoir - quantum components are typically "edgier" than their classical counterparts).

A quantum source also generates a signal. While we called the signal of classical sources "bits", we will call the signals of quantum sources "**qubits**". Just like bits, qubits can have a value of $0$ and $1$. In addition to that, however, qubits can have any value _in-between_ $0$ and $1$ - this is called a _superposition_.

What exactly does _in-between_ mean? Let's imagine a qubit in a position that is equally in the middle of $0$ and $1$. Throughout the circuit, this qubit will always remain half $0$ and half $1$, and any gates acting on it will interpret it as half $0$ and half $1$. Once we reach a measurement, however, only one of those two is chosen. If the state is perfectly in the middle of $0$ and $1$, then it will be completely random what the outcome is. If the state was closer to $0$, for instance, then it will be likelier that the outcome of the measurement is also 0, albeit still random. However, once we have measured a qubit, it will _always_ remain in the same state if we measure it again. Therefore, we say that measurements _destroy_ a qubit's superposition, and it falls back to one classical bit value.

There's one more tiny adaptation that needs to be made. We called the two possible states of a bit _OFF_ and _ON_, or $0$, and $1$. In quantum computing, these states are instead called $|0\rangle$ and $|1\rangle$,  and are not just numbers, but actually _vectors_ in _Dirac notation_. But that is starting to leave the scope of our simple getting started guide. If you want to learn more about this, check out other sources such as <a href="https://qiskit.org/textbook/preface.html">qiskit's Textbook</a>. Functionally, you can still interpret them as _OFF_ and _ON_.

Now that we have covered the basics, it is time to work on our first quantum circuit. Pick the quantum source component and place it in the editor. You will see a blue line appearing through the component's body. This is the quantum equivalent to the grey circle in the classical source components. By clicking the quantum source, you can select its initial value. While for a classical source, the choice was between 0 and 1, here we can choose any superposition of $|0\rangle$ and $|1\rangle$. The coefficients of $|0\rangle$ and $|1\rangle$ tell the component, how much weight is to be placed on the state. The probability of measuring a state will be ***the square*** of its coefficient. This means that the sum of squares of the coefficients must always be $1$. Qhoir does that automatically: If you pick any coefficient for one of the two states, it will determine the required coefficient for the other one on its own. If $|0\rangle$ has a coefficient of $1$, the coefficient of $|1\rangle$ will be $0$, etc...

This also means that if you want to have a perfectly equal superposition, the factors for $|0\rangle$ and $|1\rangle$ will not have to be $\frac{1}{2}$ each, but instead, they will be $\frac{1}{\sqrt{2}}$. There's not really an easy way to insert that precisely into the input fields, but we will learn a simpler way to get a state like that soon anyways.

Let's first start by giving $|1\rangle$ a coefficient of $0$. If you go back to the circuit, you will see that the line is now green. If you had picked a coefficient of $0.7071$ instead, you would notice that the line would have been half blue and half green.

Let us now proceed similarly to the very first circuit we built and add a component to modify the qubit. In the group `Single-Qubit Gates`, you will see a bunch of components that take a single qubit as input and modify it. The simplest one is the _X Gate_ - the quantum version of the classical _NOT_. It inverts the qubit, turning $|0\rangle$ into $|1\rangle$ and vice versa. If the qubit is in a superposition, it will invert the factors instead: The coefficient of $|0\rangle$ becomes the coefficient of $|1\rangle$ and the other way round!

Try adding an _X Gate_ to the circuit and connecting its input socket to the source component's output socket by clicking them one after the other. Notice how quantum sockets have a slightly blue hue to them and light up in blue if you hover them. Quantum sockets and classical sockets cannot be linked to each other!

Just like before, while we may have added a new gate to the circuit, we still have no real way of observing its effects. To do that, we have to add a _quantum measurement_ to the circuit. It is the last component in the `Tools` group. Again, you can distinguish it from the classical measurement through its hard edges. Connect one of them to the output of the X Gate. The grey area inside the measurement will be light grey if the qubit is in state $|1\rangle$ and dark grey if its in state $|0\rangle$. If it's in a superposition, it will be coloured partially in both colours, where the area of the colour corresponding to the larger coefficient will be larger. If you prefer a more precise view, you can also click the measurement component to open its details view, where you will be greeted by a bar chart with the probabilities - a full bar equals a probability of 1 (Keep in mind the measurement measures probabilities, _NOT_ coefficients of the states. This means that the values will actually be the squares of what you have entered in the source component).

Now, while this may have been our first quantum circuit, it does not have anything we couldn't have observed with a classical circuit either, so let us slightly modify it to make things more interesting: Delete the X gate again (using the eraser from the utensil bar up top), and instead add an _H Gate_ between the source and the measurement. This is known as the _Hadamard_ operator, one of the most important gates in quantum computing, introducing superpositions to otherwise basic states. If given the state $|0\rangle$, the Hadamard operator transforms it into the perfectly equal superposition: $\frac{|0\rangle + |1\rangle}{\sqrt{2}}$. This state is so popular that is has its own name: $|+\rangle$. The state $|1\rangle$, on the other hand, will be transformed to $\frac{|0\rangle - |1\rangle}{\sqrt{2}}$ instead. Seems similar at first, but it is actually quite different and popularly called $|-\rangle$.

After this modification, you should see that the measurement results will be exactly $50\%$ for each state. Superposition is the source of power that many popular quantum algorithms take advantage of. Here's another fun thing to try: What happens, if you add a second _H Gate_ after the first one and before the measurement?

...

The state returns back to its default! This is because the Hadamard operator is actually its own inverse! You can try and play around with it some more.

There is one final thing worth checking out before we move on: As mentioned above, measurements fundamentally interfere with the quantum system, and therefore, measurements can affect and irreversibly change the state of a qubit - on a physical quantum computer. Qhoir is built on a Statevector simulator, however. This means, that it actually has the ability to do measurements without affecting the quantum state as well. But in some cases, the effect of measurements might be beneficial for our algorithm. This is where measurement groups come into play. 

Open the details view of a measurement component to select its group by clicking the group name you want. In Qhoir, measurements only "see" other measurements that belong to the same group. If your quantum circuit has two measurements, one of which is in group BLUE and one in group RED, then both measurements will produce results as if they were the only measurements in the circuit. If both are in the same group, however, then the result of one of the two will affect the other one. Furthermore, the bar chart in the measurement will contain probabilities of any possible combination of $0$ and $1$ states of all measurements in the same group.

A simple way to demonstrate this is by adding a second measurement after the first one, connecting its input with the previous component's output (preferably going back to the previous circuit where we only had ONE H gate, and not two). Then, add both components to the BLUE measurement group. From the circuit view, both will have a 50/50 rate of $|0\rangle$ and $|1\rangle$ in their results. However, if you open them up, you will notice that the results are not a perfectly equal distribution.

![measurement]

The outcomes $00$ and $11$ will both have a probability of $50\%$, while outcomes $01$ and $10$ will have a probability of $0\%$. Why? As mentioned above, once a qubit is measured in a state, all further measurements will return the same state. That means, if the first measurement measures $|0\rangle$, then the second one will always also measure $|0\rangle$. If the first one measures $|1\rangle$, so will the second one. In other words: It is not possible for the first measurement to get $|0\rangle$ and the second one to get $|1\rangle$ and vice versa.

## 4) Working with Quantum Components: Entanglement

As mentioned earlier, one of the key concepts that give quantum computing its power is superposition. However, there is also a second related concept that plays a big role in quantum information: _Entanglement_. When two qubits are entangled, they construct a special relationship with each other. After that, certain modifications on one of them will also have an effect on the other one (even if they are very far apart). 

In this exercise, we will construct the simplest entangled state, known as the _Bell State_ $|\Phi^+\rangle$.

Let us start with a circuit consisting of two quantum source components. We will then pick our first two-qubit gate from the `Multi-Qubit Gates` group, known as the _Controlled X Gate_ (also known as _CX_, or _CNOT_). This gate has two inputs and two outputs. In fact, you will notice that all quantum gates have the same number of inputs and outputs. This is because quantum operators must be _reversible_, if a gate transforms a state from $a$ to $b$, then $b$ must have all the necessary information to go back from $b$ to $a$. If we have fewer outputs than inputs, this is not always possible.

_CX_ is one of a set of gates called _controlled_ gates. These gates take two inputs, but one of them is actually just used as a reference, and not modified. The general workflow of a controlled gate is as follows:
If the _control_ qubit is in state $|1\rangle$, then we apply our gate's action to the _target_ qubit. If the control is in state $|0\rangle$, we don't do anything. If the control qubit is in some superposition, then we only apply the action partially. In the case of _CX_, the "action" consists of just applying the _X_ gate to the target qubit.

Let's try and add a _CX_ gate to the circuit. It is the very first component in the `Multi-Qubit Gates` category. You will see the two input sockets, one on the left, and one on the top into the black bar. The top one is the _control_, the bottom one is the action qubit. The outputs are both on the right side, the top one corresponds to the control, and will just be in the same state as the control qubit was originally. The bottom one may have been modified by an X gate if the control qubit was in state $|1\rangle$. Sounds quite complex, but if you try it out, you will see it's not even that hard! Add two quantum measurements in the same measurement group to the outputs of CX, and then see how it changes based on the values of the inputs.

In any case, while this may already be interesting, it is not as interesting as the _Bell State_ I promised before, so we still need to make one slight modification. Let's now pick a Hadamard gate (single-qubit) from the `Single-Qubit Gates` list and add it in between the control qubit's source and the CX gate, like in the picture below. What exactly does that mean?

![bell_1]

The Hadamard changes the state from $|0\rangle$ to $|+\rangle$, a perfectly equal superposition of $0$ and $1$. After that, this new state is used as the control for the CX gate. If it is $|0\rangle$, we don't do anything to the second qubit. If it is $|1\rangle$, we change the second qubit to $|1\rangle$. As this happens with a chance of $50/50$, the second qubit will now also be in a perfectly equal superposition. However, this is not the same as applying H to both qubits independently. If we measure the second qubit and see it is $|1\rangle$, that means an X gate must have been applied to it, so therefore the first qubit also must have had to be $|1\rangle$. If we measure $|0\rangle$, instead, that means we certainly did NOT apply an X gate, therefore the first qubit was in state $|0\rangle$ as well. As we said before, after a measurement, the qubit's superposition will _fall back_ to just precisely the measured state, and all further measurements will return the same results. However, in an entangled state like this one, measuring one of the qubits will also make the other one fall back to a non-superposition state. This behaviour plays a large role in quantum computing, and the state we have defined here is commonly known as one of the four Bell States, in particular, $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$.

The other three Bell States are:

$$|\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}$$
$$|\Psi^+\rangle = \frac{|01\rangle + |10\rangle}{\sqrt{2}}$$
$$|\Psi^-\rangle = \frac{|01\rangle - |10\rangle}{\sqrt{2}}$$

As a short exercise, try and find the circuits for the remaining three Bell States! You can find the solution in the <a href="../samples">samples folder</a>!

## 5) Going Beyond

We have now covered all the basics required to get into the construction of quantum circuits. There is still a lot more theory behind all of this, but Qhoir is built on the principle of learning by doing, so just hop into it and try out whatever comes to your mind!

In fact, Qhoir should really be seen as a didactical tool, rather than a high-end quantum simulator. The focus has not been put into creating an incredibly efficient simulator. If you add more and more qubits, you will notice the performance getting quite poor rather soon. The simulation of quantum systems is a hard problem, after all.

If you want some pointers, there are still some more <a href="../samples">samples</a> to check out, which go beyond the scope of this introduction. Best of luck, and let's get qwiring!

[half_adder_1]: images/half_adder_1.png
[half_adder_2]: images/half_adder_2.png
[measurement]: images/measurement.png
[bell_1]: images/bell_1.png
