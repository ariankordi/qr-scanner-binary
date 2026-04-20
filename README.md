# qr-scanner-binary (Arian’s fork)

Fork of the lightweight [TypeScript library by nimiq](https://github.com/nimiq/qr-scanner) for scanning QR codes in web browsers.

### Notable changes
* **Support for [emitting binary data](https://github.com/ariankordi/qr-scanner-binary/commit/836adad37b2bf3c4f2de8d870b3c990718ec5347)** alongside string data
  - Exposed as [`ScanResult.binaryData`](https://github.com/ariankordi/qr-scanner-binary/blob/7056c662a42c1cc77ca9c4fd661734e6d69a959c/types/qr-scanner.d.ts#L94).
  - NOTE: Only works if BarcodeDetector is not used. There should be an option to disable that manually later on.
* Modifications to allow [building with Google Closure Compiler](https://github.com/ariankordi/qr-scanner-binary/commit/e5883a38f34139a4a3d79dc93a04fff45349c4b2) for more aggressive minimization
  - This reduces the worker **from 43 KB -> 26 KB**, even if you don't build the entire project with Closure Compiler.
* [Miscellaneous additions](https://github.com/ariankordi/qr-scanner-binary/commits/master/) pulled from all other forks, as of March 2026
  - Add ["willReadFrequently" to canvas](https://github.com/ariankordi/qr-scanner-binary/commit/06eb7678383ed39e4982bd2ad69f861920efac08) for better performance
  - [Removal](https://github.com/ariankordi/qr-scanner-binary/commit/3c2f6b65429b33c487896f472730f513ef2fa188) of deprecated APIs (partially by sysop)
  - Fix [BarcodeDetector for macOS/Apple Silicon/Chromium >= 113](https://github.com/ariankordi/qr-scanner-binary/commit/42d6939bd80d1c96ded94887d1bb8401e612eb0c)
  - More potential additions: I made a [list of all significant changes across all forks](https://github.com/nimiq/qr-scanner/issues/266#issuecomment-4002075121) that can be read.

### Library Usage
Refer to the [original README](https://github.com/nimiq/qr-scanner/blob/master/README.md) for all usage info.

To rebuild this fork, clone **recursively**, then run npm build.
```
git clone --recursive https://github.com/ariankordi/qr-scanner-binary
cd qr-scanner-binary
npm install --include=dev
npm run-script build
```

### Installing

* Install via NPM from git:
```
npm install https://github.com/ariankordi/qr-scanner-binary#v1.6.2
```

* The available builds are different from the original.
  - **No** umd.min.js
  - `qr-scanner.esm.min.js` - ES module, contains the library using the external worker. Recommended for web browsers where the worker may be optional.
  - `qr-scanner.esm.all.js` - ES module, contains the worker inline (default, convenient for bundlers).
  - `qr-scanner.browser.min.js` - IIFE for non-ES6 modules environment (standard web browsers) with the worker inline.

### Including on a web page

1. Without ES modules.
```html
<script src="https://cdn.jsdelivr.net/gh/ariankordi/qr-scanner-binary@v1.6.2/qr-scanner.browser.min.js"></script>
<script>
    console.debug(QrScanner);
</script>
```

2. With ES modules - recommended for new apps.
```html
<script type="importmap">
    {
        "imports": {
            "qr-scanner-binary": "https://esm.sh/gh/ariankordi/qr-scanner-binary@v1.6.2/qr-scanner.esm.min.js"
        }
    }
</script>
<script type="module">
    import QrScanner from 'qr-scanner-binary';
    console.debug(QrScanner);
</script>
```

### jsQR as submodule

In order to get the Closure Compiler build working, I had to include jsQR ('s fork used by qr-scanner) as a submodule instead of importing from npm. Because:
* Enums from jsQR were not being mapped properly, since tsc turns all enums into some sort of function that confuses Closure Compiler.
* The solution is to rebuild with esbuild which inlines the enums, however jsQR's package only provided the build and not the TypeScript source.
* Therefore, including it as a submodule allows us to rebuild that TypeScript source directly.
There was also the option to make yet another fork whose only addition would be to have been built with esbuild, but I didn't want to.
