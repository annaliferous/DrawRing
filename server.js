const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const qs = require("qs");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { rejects } = require("assert");

const server = express();

server.set("query parser", (str) => qs.parse(str, {}));
server.use(cors());
server.use(express.json());

// Create Data Directory
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let port;
let parser;

function initializeSerial() {
  try {
    //Connection with Pico with Serial
    const { SerialPort } = require("serialport");

    port = new SerialPort({
      path: "/dev/ttyACM0",
      baudRate: 9600,
      autoOpen: false,
    });

    // Parser for received data
    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    //Open Port
    port.open((err) => {
      if (err) {
        console.error("Failed to open serial port:", err);
        port = null;
      } else {
        console.log("✅ Serial port opened successfully");
        resetMotors();

        // Listener for data from Pico
        parser.on("data", (data) => {
          console.log(`Received from Pico: ${data}`);
        });
      }
    });

    port.on("error", (err) => {
      console.error("Serial port error:", err);
    });
  } catch (err) {
    console.error("Failed to initialize serial port:", err);
  }
}
//reset Motors after every mode chnage
function resetMotors() {
  console.log("Resetting motors to 0...");
  sendToPico(0);
}

function sendToPico(value) {
  if (!port || !port.isOpen) {
    console.warn("Serial port not open — cannot send");
    return;
  }

  const message = `${value}\n`;
  port.write(message, (err) => {
    if (err) console.error("Serial write failed:", err.message);
  });
}

// Pico value handler
server.get("/save/:value", (req, res) => {
  const picoValue = req.params.value;
  console.log(`Received Pico Value: ${picoValue}`);

  sendToPico(picoValue);

  res.send("Pico Value received and sent");
});

// Shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");

  if (port && port.isOpen) {
    port.close(() => {
      console.log("Serial port closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start Server on Port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
  initializeSerial();
});
