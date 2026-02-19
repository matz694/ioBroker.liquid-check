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

				await this.extendObjectAsync(stateId, {
					type: "state",
					common: {
						name: stateId,
						type: type,
						role: "sensor",
						read: true,
						write: false,
					},
					native: {},
				});

				await this.setStateAsync(stateId, { val: value, ack: true });
			}
		}
	}

	private isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	private async fetchData(): Promise<void> {
		if (this.isFetching) {
			return;
		}

		if (!this.isValidUrl(this.config.option2)) {
			this.log.error("Invalid URL: " + this.config.option2);
			await this.setStateAsync("info.connection", { val: false, ack: true });
			return;
		}

		this.isFetching = true;
		try {
			const response = await axios.get(this.config.option2, { timeout: 10000 });
			const data = response.data;
			this.log.debug("Daten empfangen: " + JSON.stringify(data));

			await this.processData(data.payload);
			await this.setStateAsync("info.connection", { val: true, ack: true });

		} catch (err: any) {
			this.log.error("Fehler beim Laden der Daten: " + err.message);
			await this.setStateAsync("info.connection", { val: false, ack: true });
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
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		this.log.info("Poll Intervall: " + this.config.checkInterval);
		this.log.info("Poll Url option2: " + this.config.option2);

		await this.setStateAsync("info.connection", { val: false, ack: true });

		this.subscribeStates("*");

		this.startInterval();

		try {
			await this.fetchData();
		} catch (e) {
			this.log.error("Initial data fetch failed: " + e);
		}
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
		} catch {
			callback();
		}
	}

	private startInterval(): void {
		if (this.interval) {
			clearInterval(this.interval);
		}
		const intervalMs = (this.config.checkInterval || 15) * 60 * 1000;
		this.interval = this.setInterval(() => this.fetchData(), intervalMs);
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