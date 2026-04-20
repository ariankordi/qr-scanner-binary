# qr-scanner-binary (Arian’s fork)

Fork of the lightweight [TypeScript library by nimiq](https://github.com/nimiq/qr-scanner) for scanning QR codes in web browsers.

### Notable changes
* **Support for [reading binary data](https://github.com/ariankordi/qr-scanner-binary/commit/836adad37b2bf3c4f2de8d870b3c990718ec5347)**
  - Exposed as [`ScanResult.binaryData`](https://github.com/ariankordi/qr-scanner-binary/blob/7056c662a42c1cc77ca9c4fd661734e6d69a959c/types/qr-scanner.d.ts#L94).
  - NOTE: Only works if BarcodeDetector is not used. There should be an option to disable that manually later on.
* Modifications to allow [building with Google Closure Compiler](https://github.com/ariankordi/qr-scanner-binary/commit/e5883a38f34139a4a3d79dc93a04fff45349c4b2) for more aggressive minimization
* [Removal](https://github.com/ariankordi/qr-scanner-binary/commit/3c2f6b65429b33c487896f472730f513ef2fa188) of deprecated APIs (partially by sysop)
* [Miscellaneous additions](https://github.com/ariankordi/qr-scanner-binary/commits/master/) pulled from all other forks, as of March 2026

### Usage
Refer to the [original README](https://github.com/nimiq/qr-scanner/blob/master/README.md) for all usage info.

* Install via NPM from git:
```
npm install https://github.com/ariankordi/qr-scanner-binary#v1.6.1
```

* The available builds are different from the original.
  - **No** umd.min.js
  - `qr-scanner.esm.min.js` - ES module, contains the library using the external worker.
  - `qr-scanner.esm.all.js` - ES module, contains the worker inline (default).
  - `qr-scanner.browser.min.js` - IIFE for non-ES6 modules environment (standard web browsers) with the worker inline.

* Rebuilding this fork: Clone **recursively**, then run npm build.
```
git clone --recursive https://github.com/ariankordi/qr-scanner-binary
npm install --include=dev
npm run-script build
```
