![Logo](admin/liquid-check.png)
# ioBroker.liquid-check

[![NPM version](https://img.shields.io/npm/v/iobroker.liquid-check.svg)](https://www.npmjs.com/package/iobroker.liquid-check)
[![Downloads](https://img.shields.io/npm/dm/iobroker.liquid-check.svg)](https://www.npmjs.com/package/iobroker.liquid-check)
![Number of Installations](https://iobroker.live/badges/liquid-check-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/liquid-check-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.liquid-check.png?downloads=true)](https://nodei.co/npm/iobroker.liquid-check/)

**Tests:** ![Test and Release](https://github.com/matz694/ioBroker.liquid-check/workflows/Test%20and%20Release/badge.svg)

## liquid-check adapter for ioBroker

This adapter reads data from a Liquid-Check sensor device and makes it available as states in ioBroker. The sensor measures liquid levels and provides various measurement data via a JSON API.

### Features

- Automatic polling of sensor data at configurable intervals
- Support for various data types (string, number, boolean)
- Connection status indicator
- Configurable data source URL
- Robust error handling with automatic retry

### Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| checkInterval | Polling interval in minutes | 15 |
| option2 | URL to the sensor JSON API | http://liquid-check/infos.json |

### Expected Data Format

The adapter expects JSON data in the following format:

```json
{
  "payload": {
    "sensor1": 100,
    "sensor2": "active",
    "temperature": 25.5
  }
}
```

All nested values in `payload` will be created as ioBroker states.

### ioBroker States

- `info.connection` - Connection status (true/false)
- `<key>` - Dynamic states based on sensor data

## Changelog

### 0.0.3 **WORK IN PROGRESS**
* (matz694) Bug fixes, best practices compliance, dependency updates

### 0.0.2 (2025-12-26)
* (matz694) Initial release

## License

MIT License

Copyright (c) 2025 matz694 <mstroske [at] gmail [dot] com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
