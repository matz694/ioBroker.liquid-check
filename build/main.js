"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
class LiquidCheck extends utils.Adapter {
  interval;
  async processData(data, path = "") {
    for (const key of Object.keys(data)) {
      const value = data[key];
      const stateId = path ? `${path}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        await this.processData(value, stateId);
      } else {
        this.log.info(`Processing key: ${stateId} with value: ${value}`);
        let type;
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
            type = "string";
        }
        await this.setObjectNotExistsAsync(stateId, {
          type: "state",
          common: {
            name: stateId,
            type,
            role: "value",
            read: true,
            write: false
          },
          native: {}
        });
        await this.setStateAsync(stateId, { val: value, ack: true });
      }
    }
  }
  async fetchData() {
    try {
      const response = await import_axios.default.get(this.config.option2, { timeout: 1e4 });
      const data = response.data;
      this.log.info("Daten empfangen: " + JSON.stringify(data));
      await this.processData(data.payload);
    } catch (err) {
      this.log.error("Fehler beim Laden der Daten: " + err.message);
    }
  }
  constructor(options = {}) {
    super({
      ...options,
      name: "liquid-check"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.log.info("Poll Intervall: " + this.config.checkInterval);
    this.log.info("Poll Url option2: " + this.config.option2);
    await this.fetchData();
    const intervalMs = (this.config.checkInterval || 15) * 1e3;
    this.interval = this.setInterval(() => this.fetchData(), intervalMs);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
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
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
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
  module.exports = (options) => new LiquidCheck(options);
} else {
  (() => new LiquidCheck())();
}
//# sourceMappingURL=main.js.map
