let isDrawing = false;
let lastColor = 'white';

let gridSize = 37;
const pixelSize = 10;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridSizeSlider = document.getElementById('gridSizeSlider');
const gridSizeDisplay = document.getElementById('gridSizeDisplay');

function initCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear existing canvas
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
    drawGridLines();
}

function drawGridLines() {
    ctx.strokeStyle = 'gray';
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, gridSize * pixelSize);
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(gridSize * pixelSize, i * pixelSize);
        ctx.stroke();
    }
}

// Update the canvas when the slider value changes
gridSizeSlider.oninput = function() {
    gridSize = parseInt(this.value);
    gridSizeDisplay.textContent = gridSize;
    canvas.width = canvas.height = gridSize * pixelSize;
    initCanvas();
};

function getMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((event.clientX - rect.left) / pixelSize),
        y: Math.floor((event.clientY - rect.top) / pixelSize)
    };
}

function drawPixel(event) {
    if (!isDrawing) return;
    const pos = getMousePosition(canvas, event);
    ctx.fillStyle = lastColor;
    ctx.fillRect(pos.x * pixelSize, pos.y * pixelSize, pixelSize, pixelSize);
    drawGridLines(); // Redraw grid lines after drawing/erasing a pixel
}

canvas.addEventListener('mousedown', function (event) {
    isDrawing = true;
    lastColor = event.button === 0 ? 'white' : 'black'; // Left click for white, right click for black
    drawPixel(event);
});

canvas.addEventListener('mousemove', drawPixel);

canvas.addEventListener('mouseup', function () {
    isDrawing = false;
});

canvas.addEventListener('mouseout', function () {
    isDrawing = false;
});

// Prevent the context menu from opening on right click
canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// Initialize the canvas with grid lines
initCanvas();

function exportAsEncodedString() {
    const width = gridSize; // Logical width (36)
    const height = gridSize; // Logical height (36)
    const bytes = new Uint8Array(Math.ceil(width * height / 8));
    const imageData = ctx.getImageData(0, 0, width * pixelSize, height * pixelSize);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Flag to determine if the current logical pixel is white
            let isWhite = false;

            // Loop through the 10x10 block representing the logical pixel
            for (let dy = 0; dy < pixelSize; dy++) {
                for (let dx = 0; dx < pixelSize; dx++) {
                    // Calculate the index in the image data array
                    const index = ((y * pixelSize + dy) * width * pixelSize + (x * pixelSize + dx)) * 4;
                    // Check if the pixel is white
                    if (imageData.data[index] === 255 && imageData.data[index + 1] === 255 && imageData.data[index + 2] === 255) {
                        isWhite = true;
                        break;
                    }
                }
                if (isWhite) {
                    break;
                }
            }

            if (isWhite) {
                const bitIndex = x + y * width;
                const byteIndex = Math.floor(bitIndex / 8);
                const bit = 1 << (bitIndex % 8);
                bytes[byteIndex] |= bit;
            }
        }
    }

    const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    const base64String = btoa(binaryString)
        .replace(/=/g, '').replace(/\n/g, '');
 
    const crosshair_string = `LCCH-${gridSize}-` + base64String;
    
    const outputBox = document.getElementById('outputBox');
    outputBox.value = crosshair_string;
    outputBox.style.display = 'block';
}

document.getElementById('exportButton').addEventListener('click', exportAsEncodedString);
