// window.onclick = () => {
//     const ctx = new (window.AudioContext || window.webkitAudioContext)();
//
//     // create an empty three-second stereo buffer at the sample rate of the audio context
//     const myArrayBuffer = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
//
//     for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
//         // This gives us the actual array that contains the data
//
//         let freq = 0.5;
//         let gain = -1.0;
//
//         let lower = false;
//
//         const nowBuffering = myArrayBuffer.getChannelData(channel);
//         for (let i = 0; i < myArrayBuffer.length; i++) {
//             // Math.random() is in [0; 1.0]
//             // audio needs to be in [-1.0; 1.0]
//
//             if (gain < -1.0) lower = false;
//             if (gain > 1.0) lower = true;
//
//             if (lower) {
//                 gain -= 0.0001;
//             } else {
//                 gain += 0.0001;
//             }
//
//             freq = gain;
//
//             nowBuffering[i] = Math.sin(i * freq) * gain;
//         }
//     }
//
//     const source = ctx.createBufferSource();
//
//     source.buffer = myArrayBuffer;
//
//     source.connect(ctx.destination);
//
//     source.start();
// };

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();


const playNote = (frequency) => {
    let oscillator = audioCtx.createOscillator();

    oscillator.type = "square";
    oscillator.frequency.value = frequency; // value in hertz
    // oscillator.frequency.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 2);

    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    // let gainNode = audioCtx.createGain();

    console.log(oscillator.frequency.value);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    return oscillator;
};

function plotSine(canvas, ctx, frequency) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    let scale = 20;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(66,44,255)";

    let x = 0;
    let y = 0;
    let amplitude = 40;
    //ctx.moveTo(x, y);
    while (x < width) {
        y = height/2 + amplitude * Math.sin(x/frequency);
        ctx.lineTo(x, y);
        x = x + 1;
    }
    ctx.stroke();
}

let keys = {
    "KeyA": null,
    "KeyW": null,
    "KeyS": null,
    "KeyE": null,
    "KeyD": null,
    "KeyF": null,
    "KeyT": null,
    "KeyG": null,
    "KeyY": null,
    "KeyH": null,
    "KeyU": null,
    "KeyJ": null,
    "KeyK": null,
};

function playNote() {

}

let notes = [
    130.81, // A
    138.59, // W
    146.83, // S
    155.56, // E
    164.81, // D
    174.61, // F
    185.00, // T
    196.00, // G
    207.65, // Y
    220.00, // H
    233.08, // U
    246.94, // J
    261.63, // K
];

document.body.addEventListener("keydown", (ev) => {


    console.log(keys);

    if (keys[ev.code] === null) {
        keys[ev.code] = playNote(notes[Object.keys(keys).indexOf(ev.code)]);
    }
});

document.body.addEventListener("keyup", (ev) => {
    keys[ev.code].stop(0);
    keys[ev.code] = null;
});