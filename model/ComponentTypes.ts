type ComponentType = {
    id: number,
    name: string,
    imageName: string
}

const componentTypes: { [id: number]: ComponentType } = {};

//Tools------------------------------------
componentTypes[0] = {
    id: 0,
    name: "Source (classical)",
    imageName: "components/classical-source.png"
}

componentTypes[1] = {
    id: 1,
    name: "Source (quantum)",
    imageName: "components/quantum-source.png"
}

componentTypes[2] = {
    id: 2,
    name: "Sink (classical)",
    imageName: "components/classical-sink.png"
}

componentTypes[3] = {
    id: 3,
    name: "Sink (quantum)",
    imageName: "components/quantum-sink.png"
}

componentTypes[17] = {
    id: 17,
    name: "Measure (classical)",
    imageName: "components/classical-measure.png"
}

componentTypes[18] = {
    id: 18,
    name: "Measure (quantum)",
    imageName: "components/quantum-measure.png"
}


//Classical Gates------------------------------------
componentTypes[4] = {
    id: 4,
    name: "NOT",
    imageName: "components/not.png"
}

componentTypes[5] = {
    id: 5,
    name: "AND",
    imageName: "components/and.png"
}

componentTypes[6] = {
    id: 6,
    name: "OR",
    imageName: "components/or.png"
}

componentTypes[7] = {
    id: 7,
    name: "NAND",
    imageName: "components/nand.png"
}

componentTypes[8] = {
    id: 8,
    name: "NOR",
    imageName: "components/nor.png"
}

componentTypes[9] = {
    id: 9,
    name: "XOR",
    imageName: "components/xor.png"
}

componentTypes[10] = {
    id: 10,
    name: "XNOR",
    imageName: "components/xnor.png"
}


//Single-Qubit Gates------------------------------------
componentTypes[11] = {
    id: 11,
    name: "X",
    imageName: "components/x.png"
}

componentTypes[12] = {
    id: 12,
    name: "Y",
    imageName: "components/y.png"
}

componentTypes[13] = {
    id: 13,
    name: "Z",
    imageName: "components/z.png"
}

componentTypes[14] = {
    id: 14,
    name: "H",
    imageName: "components/h.png"
}

componentTypes[15] = {
    id: 15,
    name: "S",
    imageName: "components/s.png"
}

componentTypes[16] = {
    id: 16,
    name: "T",
    imageName: "components/t.png"
}

//Controlled Multi-Qubit----------------------
//Single-Qubit Gates------------------------------------
componentTypes[19] = {
    id: 19,
    name: "CX",
    imageName: "components/cx.png"
}

componentTypes[20] = {
    id: 20,
    name: "CY",
    imageName: "components/cy.png"
}

componentTypes[21] = {
    id: 21,
    name: "CZ",
    imageName: "components/cz.png"
}

componentTypes[22] = {
    id: 22,
    name: "CH",
    imageName: "components/ch.png"
}

componentTypes[23] = {
    id: 23,
    name: "CS",
    imageName: "components/cs.png"
}

componentTypes[24] = {
    id: 24,
    name: "CT",
    imageName: "components/ct.png"
}

componentTypes[25] = {
    id: 25,
    name: "R",
    imageName: "components/r.png"
}

componentTypes[26] = {
    id: 26,
    name: "CR",
    imageName: "components/cr.png"
}

componentTypes[27] = {
    id: 27,
    name: "Fork",
    imageName: "components/fork.png"
}

componentTypes[28] = {
    id: 28,
    name: "Swap",
    imageName: "components/swap.png"
}

componentTypes[29] = {
    id: 29,
    name: "Text",
    imageName: "components/text.png"
}

componentTypes[30] = {
    id: 30,
    name: "Area",
    imageName: "components/area.png"
}

componentTypes[31] = {
    id: 31,
    name: "Edge (classical)",
    imageName: "components/classical-pipe.png"
}

componentTypes[32] = {
    id: 32,
    name: "Edge (quantum)",
    imageName: "components/quantum-pipe.png"
}

componentTypes[33] = {
    id: 33,
    name: "CCNOT",
    imageName: "components/ccx.png"
}



export type { ComponentType }

export { componentTypes }
