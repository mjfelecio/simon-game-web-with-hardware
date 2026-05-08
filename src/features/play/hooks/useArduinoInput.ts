import type { SimonButtonType } from "@/globals/types/simon";
import { useEffect, useRef, useState } from "react";
import { setupSerialConnection } from "simple-web-serial";

export default function useArduinoInput(
	onInput?: (color: SimonButtonType) => void,
) {
	const [isConnected, setIsConnected] = useState(false);
	const onInputRef = useRef(onInput);

	const connectionRef = useRef<ReturnType<typeof setupSerialConnection> | null>(
		null,
	);

	useEffect(() => {
		onInputRef.current = onInput;
	}, [onInput]);

	const connect = async () => {
		try {
			const connection = setupSerialConnection({
				baudRate: 9600,
				requestAccessOnPageLoad: true,
				logIncomingSerialData: true,
			});
			connectionRef.current = connection;

			// Listen for the "ack" from Arduino to confirm true connection
			connection.on("connection-ack", () => {
				console.log("Hardware Handshake Successful");
				setIsConnected(true);
			});

			// Existing button input logic
			connection.on("simon-input", (data) => {
				if (!data || typeof data !== "string") return;

				const validInputs: SimonButtonType[] = [
					"red",
					"green",
					"blue",
					"yellow",
				];
				const color = data.trim() as SimonButtonType;

				if (validInputs.includes(color)) {
					onInputRef.current?.(color);
				}
			});

			// Send the initial "syn" to the Arduino
			// We wrap this in a small delay to ensure the board is ready after the serial port opens
			setTimeout(() => {
				connection.send("connection-syn", "init");
			}, 1500);
		} catch (err) {
			console.error("Arduino Connection Failed:", err);
			setIsConnected(false);
		}
	};

	return { connect, isConnected };
}
