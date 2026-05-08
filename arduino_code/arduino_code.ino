#include <SimpleWebSerial.h>

SimpleWebSerial WebSerial;

const byte BUTTON_RED = 2;
const byte BUTTON_GREEN = 3;
const byte BUTTON_BLUE = 4;
const byte BUTTON_YELLOW = 5;

unsigned long lastDebounceTime = 0;
const byte debounceDelay = 250; // Milliseconds between allowed presses

void setup() {
  Serial.begin(9600);

  pinMode(BUTTON_RED, INPUT_PULLUP);
  pinMode(BUTTON_GREEN, INPUT_PULLUP);
  pinMode(BUTTON_BLUE, INPUT_PULLUP);
  pinMode(BUTTON_YELLOW, INPUT_PULLUP);

  // Handshake listener for knowing when the connection is ready
  WebSerial.on("connection-syn", onConnectSyn);
}

void loop() {
  // SimpleWebSerial needs to check for incoming messages in the loop
  WebSerial.check();

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (digitalRead(BUTTON_RED) == LOW) {
      sendInput("red");
    }
    else if (digitalRead(BUTTON_GREEN) == LOW) {
      sendInput("green");
    }
    else if (digitalRead(BUTTON_BLUE) == LOW) {
      sendInput("blue");
    }
    else if (digitalRead(BUTTON_YELLOW) == LOW) {
      sendInput("yellow");
    }
  }
}

void sendInput(String color) {
  WebSerial.send("simon-input", color);
  lastDebounceTime = millis();
}

void onConnectSyn(String data) {
  WebSerial.send("connection-ack", "ready");
}
