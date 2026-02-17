/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";

// Load your modules here, e.g.:
// import * as fs from "fs";
import axios from "axios";

class LiquidCheck extends utils.Adapter {
	private interval: any;
	private isFetching: boolean = false;

	private async processData(data: any, path: string = ""): Promise<void> {
    	for (const key of Object.keys(data)) {
        	const value = data[key];
        	const stateId = path ? `${path}.${key}` : key;
			if (typeof value === "object" && value !== null) {
				await this.processData(value, stateId); // Rekursiv tiefer gehen
			} else {
				this.log.info(`Processing key: ${stateId} with value: ${value}`);
				let type: "string" | "number" | "boolean";
				switch (typeof value) {
					case "string":
						type = "string";
						break;
					case "number":
						type = "number";
						break;
					case "boolean":
						type = "boolean";
						break;
					default:
						type = "string"; // Fallback für nicht unterstützte Typen
				}

				await this.setObjectNotExistsAsync(stateId, {
					type: "state",
					common: {
						name: stateId,
						type: type,
						role: "value",
						read: true,
						write: false,
					},
					native: {},
				});

				await this.setStateAsync(stateId, { val: value, ack: true });
			}
		}
	}

	private async fetchData(): Promise<void> {
		if (this.isFetching) {
			return;
		}
		this.isFetching = true;
		try {
			const response = await axios.get(this.config.option2, { timeout: 10000 });
			const data = response.data;
			this.log.debug("Daten empfangen: " + JSON.stringify(data));

			await this.processData(data.payload);

		} catch (err: any) {
			this.log.error("Fehler beim Laden der Daten: " + err.message);
		} finally {
			this.isFetching = false;
		}
	}

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "liquid-check",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("Poll Intervall: " + this.config.checkInterval);
		this.log.info("Poll Url option2: " + this.config.option2);

		await this.fetchData();

    	// Dann alle 60 Sekunden erneut
		const intervalMs = (this.config.checkInterval || 15) * 60 * 1000;
		this.interval = this.setInterval(() => this.fetchData(), intervalMs);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);
			if (this.interval) {
				clearInterval(this.interval);
			}
			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new LiquidCheck(options);
} else {
	// otherwise start the instance directly
	(() => new LiquidCheck())();
}