#include <SimpleWebSerial.h>

SimpleWebSerial WebSerial;

/**
 * Button input pins.
 */
const byte BUTTON_RED = 2;
const byte BUTTON_GREEN = 3;
const byte BUTTON_BLUE = 4;
const byte BUTTON_YELLOW = 5;

/**
 * Debounce settings.
 */
const unsigned long DEBOUNCE_DELAY_MS = 250;
unsigned long lastDebounceTime = 0;

/**
 * Set when a handshake request is received.
 * The ACK is sent from loop() after WebSerial finishes processing.
 */
volatile bool shouldSendConnectionAck = false;

/**
 * Initializes serial communication and button pins.
 */
void setup() {
  Serial.begin(57600);

  pinMode(BUTTON_RED, INPUT_PULLUP);
  pinMode(BUTTON_GREEN, INPUT_PULLUP);
  pinMode(BUTTON_BLUE, INPUT_PULLUP);
  pinMode(BUTTON_YELLOW, INPUT_PULLUP);

  // Register handshake listener.
  WebSerial.on("connection-syn", onConnectionSyn);
}

/**
 * Main program loop.
 */
void loop() {
  // Process incoming Web Serial messages.
  WebSerial.check();

  // Send ACK after incoming packet processing completes.
  if (shouldSendConnectionAck) {
    WebSerial.send("connection-ack", "ready");
    shouldSendConnectionAck = false;
  }

  // Check buttons with software debounce.
  if (millis() - lastDebounceTime < DEBOUNCE_DELAY_MS) {
    return;
  }

  if (digitalRead(BUTTON_RED) == LOW) {
    sendInput("red");
  } else if (digitalRead(BUTTON_GREEN) == LOW) {
    sendInput("green");
  } else if (digitalRead(BUTTON_BLUE) == LOW) {
    sendInput("blue");
  } else if (digitalRead(BUTTON_YELLOW) == LOW) {
    sendInput("yellow");
  }
}

/**
 * Sends a Simon button color to the frontend.
 *
 * @param color The button color.
 */
void sendInput(const char* color) {
  WebSerial.send("simon-input", color);
  lastDebounceTime = millis();
}

/**
 * Called when the frontend sends "connection-syn".
 *
 * Do not send the ACK directly from this callback.
 * Instead, set a flag and send it from loop().
 */
void onConnectionSyn() {
  shouldSendConnectionAck = true;
}