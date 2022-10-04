let amplitudeTimeData = [
    [0, 0],
    [0.5, 0.7],
    [1.5, 0.7],
    [2, 0],
];

const synth = {
    audioContext: undefined,
    output: undefined,
    distortion: undefined,
    compressor: undefined,
    // note data
    octaves: [
        [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87,],
        [32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49.00, 51.91, 55.00, 58.27, 61.74,],
        [65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.8, 110.0, 116.5, 123.4,],
        [130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94,],
        [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88,],
        [523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77,],
        [1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53,],
        [2093.00, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520.00, 3729.31, 3951.07,],
        [4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040.00, 7458.62, 7902.13,],
    ],
    currentOctave: 4,
    keyboard: {
        // keyboard management
        keyboardKeyCodes: [
            "KeyA",
            "KeyW",
            "KeyS",
            "KeyE",
            "KeyD",
            "KeyF",
            "KeyT",
            "KeyG",
            "KeyY",
            "KeyH",
            "KeyU",
            "KeyJ",
            "KeyK",
        ],
        keysPressed: [],
        handleKeyPress: code => {
            if (!synth.keyboard.keysPressed.includes(code)
                && synth.keyboard.keyboardKeyCodes.includes(code)) {
                synth.keyboard.keysPressed.push(code);
                synth.notesHeld++;

                const keyIndex = synth.keyboard.keyboardKeyCodes.indexOf(code);

                if (keyIndex !== -1) {
                    const note = synth.octaves[synth.currentOctave][keyIndex];
                    console.log(`#note-${keyIndex} -- note: ${note}`);
                    synth.playNote(note);
                }
            }
        },
        handleKeyUp: code => {
            if (synth.keyboard.keyboardKeyCodes.includes(code)) {
                const index = synth.keyboard.keysPressed.indexOf(code);
                synth.keyboard.keysPressed.splice(index, 1);
            }
        },
    },
    notesHeld: 0,
    playNote: (frequency) => {
        // create oscillator

        let oscillator = synth.audioContext.createOscillator();
        try {
            oscillator.frequency.setValueAtTime(frequency, 0);
        } catch {
            synth.notesHeld--;
            return;
        }
        oscillator.type = document.getElementById('waveformSelect').value;

        // create gain node
        let gainNode = new GainNode(synth.audioContext);
        for (let i = 0; i < amplitudeTimeData.length - 1; i++) {
            const time = amplitudeTimeData[i][0];
            const value = amplitudeTimeData[i][1];
            gainNode.gain.linearRampToValueAtTime(value, synth.audioContext.currentTime + time);
        }

        const time = amplitudeTimeData[amplitudeTimeData.length - 1][0];
        const value = amplitudeTimeData[amplitudeTimeData.length - 1][1];

        console.log(synth.audioContext.currentTime.toFixed(2));

        gainNode.gain.linearRampToValueAtTime(0, synth.audioContext.currentTime + 2);

        console.log(`N value: ${value * (1 / synth.notesHeld)} at time: ${time}`);

        oscillator.connect(gainNode);

        gainNode.connect(synth.output);
        oscillator.start(0);
        setTimeout(() => {
                // gainNode.disconnect();
                // oscillator.disconnect();
                // gainNode = null;
                // oscillator = null;
                synth.notesHeld--;
            },
            amplitudeTimeData[amplitudeTimeData.length - 1][0] * 1000);
    },
    initialized: false,
    initialize: () => {
        synth.audioContext = new AudioContext();
        synth.output = synth.audioContext.createGain();
        synth.output.gain.setValueAtTime(1.0, synth.audioContext.currentTime + 0);

        synth.compressor = synth.audioContext.createDynamicsCompressor();

        synth.distortion = synth.distortionNode(10);

        synth.output.connect(synth.compressor);
        // synth.output.connect(synth.distortion);

        // synth.distortion.connect(synth.compressor);

        synth.compressor.connect(synth.audioContext.destination);
    },
    distortionNode(val) {
        const distortion = synth.audioContext.createWaveShaper();

        distortion.curve = synth.makeDistortionCurve(val);
        distortion.oversample = "4x";

        return distortion;
    },
    makeDistortionCurve: amount => {
        const n_samples = synth.audioContext.sampleRate,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 90;
        let i = 0, x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }
};

window.addEventListener("keydown", ev => {
    if (!synth.initialized) {
        synth.initialized = true;
        synth.initialize();
    }
    synth.keyboard.handleKeyPress(ev.code);
});

// const distortionInput = document.getElementById("distortion");
// distortionInput.onchange = () => {
//     if (distortionInput.value !== 0) {
//         synth.distortion.curve = synth.makeDistortionCurve(distortionInput.value);
//
//         synth.output.connect(synth.distortion);
//         return;
//     }
//     synth.output.connect(synth.compressor);
// }

window.addEventListener("keyup", ev => {
    synth.keyboard.handleKeyUp(ev.code);
});

let circlePositions = [];
const interactiveAmplitudeTimeGraph = () => {
    const canvas = document.getElementById("amplitudeTimeGraph");
    const ctx = canvas.getContext("2d");

    let prevX = false, prevY = false;

    let clicked = false;
    let hovering = 0;
    const largestTime = (arr) => {
        let largest = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][0] > largest) largest = arr[i][0];
        }
        return largest;
    }

    let largest = largestTime(amplitudeTimeData);
    let secondsInput = document.getElementById("graphSecondsInput");

    secondsInput.oninput = () => {
        canvas.dispatchEvent(new Event("mousemove"));
    };

    let secSub = document.getElementById("secSub");
    secSub.onclick = () => {
        handleGraphSecondsInput(secSub.innerText);
        canvas.dispatchEvent(new Event("mousemove"));
    };

    let secAdd = document.getElementById("secAdd");
    secAdd.onclick = () => {
        handleGraphSecondsInput(secAdd.innerText);
        canvas.dispatchEvent(new Event("mousemove"));
    };

    function drawAotGraph(ev) {
        ev === undefined && (ev = new Event("mousemove"));
        let seconds = secondsInput.value;
        amplitudeTimeData[amplitudeTimeData.length - 1][0] = seconds;
        // if (ev.clientX === prevX && ev.clientY === prevY)
        //     return;

        ctx.fillStyle = "#00466B";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();

        ctx.lineWidth = "3";
        ctx.strokeStyle = "#F77F00FF";

        let i = 0;

        let x = scale(
            amplitudeTimeData[0][0],
            0, seconds, 0, canvas.width
        );
        let y = scale(
            amplitudeTimeData[0][1],
            0, seconds, canvas.height, 0
        );

        circlePositions.push([x, y]);

        ctx.moveTo(x, y);
        ctx.arc(x, y, 5, 0, 2 * Math.PI);

        while (i < amplitudeTimeData.length) {
            try {
                x = scale(
                    amplitudeTimeData[i + 1][0],
                    0, seconds, 0, canvas.width
                );
                y = scale(
                    amplitudeTimeData[++i][1],
                    0, 1.0, canvas.height, 0
                );
                circlePositions.push([x, y]);

                ctx.lineTo(x, y);

                ctx.arc(x, y, 5, 0, 2 * Math.PI);
            } catch {
                ctx.lineTo(x, y);
                break;
            }
        }

        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();

        ctx.fillStyle = "#F77F00FF";
        ctx.fill();
        ctx.closePath();
        if (ev !== undefined) {
            prevX = ev.clientX;
            prevY = ev.clientY;
        }
        for (let i = 0; i < circlePositions.length; i++) {
            if (!clicked && collision(
                ev.offsetX,
                ev.offsetY,
                3,
                circlePositions[i][0],
                circlePositions[i][1],
                5)) {
                hovering = i;
                ctx.beginPath();
                ctx.fillStyle = "#a4b2da";
                ctx.arc(
                    circlePositions[i][0],
                    circlePositions[i][1],
                    8, 0, 2 * Math.PI
                );
                ctx.fill();
                ctx.closePath();
            }
        }

        if (clicked) {
            if (hovering === 0 || hovering === amplitudeTimeData.length - 1) {
                amplitudeTimeData[hovering][1] = scale(ev.offsetY, canvas.height, 0, 0, 1.0);
            } else {
                amplitudeTimeData[hovering][0] = scale(ev.offsetX, 0, canvas.width, 0, seconds);
                amplitudeTimeData[hovering][1] = scale(ev.offsetY, canvas.height, 0, 0, 1.0);
            }
        }

        ctx.beginPath();
        ctx.moveTo(circlePositions[0][0], circlePositions[0][1]);
        ctx.strokeStyle = "#D62828";
        // ctx.bezierCurveTo(
        //     circlePositions[1][0],
        //     circlePositions[1][1],
        //     circlePositions[2][0],
        //     circlePositions[2][1],
        //     circlePositions[3][0],
        //     circlePositions[3][1]);
        ctx.stroke();

        circlePositions = [];
    }
    drawAotGraph();

    canvas.onmousemove = ev => {
        drawAotGraph(ev);
    }

    canvas.onmousedown = () => {
        clicked = true;
    }
    canvas.onmouseup = () => {
        clicked = false;
    }

    window.onmousemove = ev => {
        if (clicked && ev.clientX > (canvas.offsetLeft + canvas.offsetWidth)) {
            amplitudeTimeData[hovering][0] = scale(ev.offsetX, 0, canvas.width, 0, largest);
            amplitudeTimeData[hovering][1] = scale(ev.offsetY, canvas.height, 0, 0, largest);
        }
    }

    canvas.onmouseleave = ev => {
        clicked = false;
    }
};

// const bezier = (t, p0, p1, p2, p3) => {
//     const cX = 3 * (p1[0] - p0[0]),
//         bX = 3 * (p2[0] - p1[0]) - cX,
//         aX = p3[0] - p0[0] - cX - bX;
//
//     const cY = 3 * (p1[1] - p0[1]),
//         bY = 3 * (p2[1] - p1[1]) - cY,
//         aY = p3[1] - p0[1] - cY - bY;
//
//     const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0[0];
//     const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0[1];
//
//     return {x: x, y: y};
// };

// const bezierCurve = (p0, p1, p2, p3) => {
//     let points = [];
//     const accuracy = 0.01
//
//     ctx.moveTo(p0[0], p0[1]);
//     for (let i = 0; i < 1; i += accuracy) {
//         let p = bezier(i, p0, p1, p2, p3);
//         points.push([p[0], p[1]]);
//     }
//     return points;
// }

function collision(p1x, p1y, r1, p2x, p2y, r2) {
    const x = p1x - p2x;
    const y = p1y - p2y;
    return r1 + r2 > Math.sqrt((x * x) + (y * y));
}

function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// function getMousePos(canvas, evt) {
//     let rect = canvas.getBoundingClientRect();
//     return {
//         x: evt.clientX - rect.left,
//         y: evt.clientY - rect.top
//     };
// }

interactiveAmplitudeTimeGraph();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function changeInputDisplayValue(name, element, unit) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    element.parentNode.childNodes.forEach(el => {
        if (el.nodeName === "H3") {
            el.innerText = `${name}: ${element.value}${unit}`;
        }
    });
    drawCanvas();
}

// let analyzer = audioContext.createAnalyser();
//
// function changeInputDisplayValueAttack(name, element, unit) {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//     element.parentNode.childNodes.forEach(el => {
//         if (el.nodeName === "H3") {
//             el.innerText = `${name}: ${pad(element.value, 3)}${unit}`;
//         }
//     });
//     analyzer = audioContext.createAnalyser();
//     const oscillator = audioContext.createOscillator();
//     oscillator.frequency.setValueAtTime(440, 0);
//
//     oscillator.type = "sine";
//
//     oscillator.connect(analyzer);
//
//     oscillator.start(0);
//     oscillator.stop(3);
//     drawCanvas();
// }

ctx.strokeStyle = "#f77f00";

// function drawCanvas() {
//     // const gain =
//     //     document.getElementById("gain").value;
//     // const attack =
//     //     document.getElementById("attack").value;
//     // const frequency =
//     //     document.getElementById("frequency").value;
//     //
//     // ctx.beginPath();
//     // analyzer.fftSize = 128;
//     // const bufferLength = analyzer.frequencyBinCount;
//     // const dataArray = new Uint8Array(bufferLength);
//     // const barWidth = canvas.width / bufferLength;
//     //
//     // let x = 0;
//     // ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // analyzer.getByteTimeDomainData(dataArray);
//     // for (let i = 0; i < bufferLength; i++) {
//     //     let barHeight = dataArray[i] / 10;
//     //     ctx.fillStyle = "#f77f00";
//     //     ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
//     //     x += barWidth;
//     // }
//     // ctx.stroke();
//     //
//     // requestAnimationFrame(drawCanvas);
// }

const pianoDisplay = document.getElementById("pianoDisplay");
const pianoDisplayCtx = pianoDisplay.getContext('2d');

const notes = '_-_-__-_-_-__-_-__-_-_-_';
const keys = 'awsedftgyhuj';

let keyPosMap = {};

// function drawChart() {
//
// }

function drawPiano() {
    let naturalsCount = 0;

    // count the number of naturals from the notes string
    for (let i = 0; i < notes.length; i++) {
        if (notes[i] === '_') {
            naturalsCount++;
        }
    }

    // calculate the width of each key
    const naturalsWidth = pianoDisplay.width / naturalsCount + 1;
    // const naturalsWidth = (pianoDisplay.width / 14) + 1;
    const sharpsWidth = naturalsWidth * 0.5;

    let offset = 0;

    let sharpPositions = [];
    let naturalIndex = 0;
    for (let i = 0; i < notes.length; i++) {
        if (notes[i] === '_') {
            naturalIndex++ % 2 === 0
                ? pianoDisplayCtx.fillStyle = "#ffffff"
                : pianoDisplayCtx.fillStyle = "#ececec";
            pianoDisplayCtx.fillRect(offset, 0, naturalsWidth, pianoDisplay.height);
            if (notes[i + 1] === '-') {
                sharpPositions.push(offset + (naturalsWidth * 0.75));
                keyPosMap[keys[i + 1]] = [offset + (naturalsWidth * 0.75), sharpsWidth, pianoDisplay.height * 0.5];
            }
            keyPosMap[keys[i]] = [offset, naturalsWidth, pianoDisplay.height];
            offset += naturalsWidth - 1;
        }
    }

    pianoDisplayCtx.fillStyle = "#000000";
    for (let i = 0; i < sharpPositions.length; i++) {
        pianoDisplayCtx.fillRect(sharpPositions[i], 0, sharpsWidth, pianoDisplay.height * 0.5);
    }
}

drawPiano();

// let oscillators = [
//     [undefined, false], [undefined, false],
//     [undefined, false], [undefined, false],
//     [undefined, false], [undefined, false],
//     [undefined, false], [undefined, false],
//     [undefined, false], [undefined, false],
//     [undefined, false], [undefined, false],
// ];

window.onkeydown = ev => {
    try {
        // edit piano display
        pianoDisplayCtx.fillStyle = "#fcbf49";
        const lookup = ev.code.charAt(ev.code.length - 1).toLowerCase();
        const keyData = keyPosMap[lookup];
        pianoDisplayCtx.fillRect(
            keyData[0],
            0,
            keyData[1],
            keyData[2]
        );
        if (notes[keys.indexOf(lookup) + 1] === '-') {
            pianoDisplayCtx.fillStyle = "#000000";
            const k = keyPosMap[keys[keys.indexOf(lookup) + 1]];
            pianoDisplayCtx.fillRect(
                k[0],
                0,
                k[1],
                k[2]
            );
        }
        if (notes[keys.indexOf(lookup) - 1] === '-') {
            pianoDisplayCtx.fillStyle = "#000000";
            const k = keyPosMap[keys[keys.indexOf(lookup) - 1]];
            pianoDisplayCtx.fillRect(
                k[0],
                0,
                k[1],
                k[2]
            );
        }

        // play note
        // const oscillator = audioContext.createOscillator();
        // oscillator.frequency.setValueAtTime(
        //     synth.octave[synth.currentOctave.toString()][keys.indexOf(lookup)],
        //     0);

        // const oscillatorIndex = keys.indexOf(lookup);
        // if (!oscillators[oscillatorIndex][1]) {
        //     oscillators[oscillatorIndex][1] = true;
        //     oscillators[oscillatorIndex][0] = oscillator;
        // }
    } catch {
    }
};

window.onkeyup = ev => {
    try {
        const lookup = ev.code.charAt(ev.code.length - 1).toLowerCase();
        if (notes[keys.indexOf(lookup)] === '_') {
            [2, 5, 9].includes(keys.indexOf(lookup))
                ? pianoDisplayCtx.fillStyle = '#ececec'
                : pianoDisplayCtx.fillStyle = '#ffffff';
        } else {
            pianoDisplayCtx.fillStyle = '#000000';
        }
        const keyData = keyPosMap[lookup];
        pianoDisplayCtx.fillRect(
            keyData[0],
            0,
            keyData[1],
            keyData[2]
        );
        pianoDisplayCtx.fillStyle = '#000000';
        if (notes[keys.indexOf(lookup) + 1] === '-') {
            const k = keyPosMap[keys[keys.indexOf(lookup) + 1]];
            pianoDisplayCtx.fillRect(k[0], 0, k[1], k[2]);
        }
        if (notes[keys.indexOf(lookup) - 1] === '-') {
            const k = keyPosMap[keys[keys.indexOf(lookup) - 1]];
            pianoDisplayCtx.fillRect(k[0], 0, k[1], k[2]);
        }
    } catch {
    }
};

// requestAnimationFrame(drawCanvas);

// function pad(num, size) {
//     if (num.length === 3) {
//         return num.toString() + '0';
//     } else if (num.length === 1) {
//         return num.toString() + '.00';
//     }
//     return num.toString();
// }

function handleGraphSecondsInput(action) {
    const input = document.getElementById('graphSecondsInput');

    action === '-'
        ? --input.value
        : ++input.value;

    clampInputVal(input, 0, 10);
}

function clampInputVal(el, min, max) {
    if (el.value <= min) {
        el.value = min;
    } else if (el.value >= max) {
        el.value = max;
    }
}

// piano control panel
const octaveSub = document.getElementById("octaveSub");
octaveSub.onclick = () => {
    if (synth.currentOctave >= 0) {
        --synth.currentOctave;
    }
};

const octaveAdd = document.getElementById("octaveAdd");
octaveAdd.onclick = () => {
    if (synth.currentOctave <= 8) {
        ++synth.currentOctave;
    }
};

// drawCanvas();
