# Patches for Module Resolution Issues

## @nemi-fi/wallet-sdk Module Resolution Fix

This patch fixes the "Default condition should be last one" error when using `moduleResolution: "nodenext"` and `"type": "module"`.

### Manual Patch Instructions

If you encounter build errors with the @nemi-fi/wallet-sdk package, you can manually patch it by following these steps:

1. Navigate to `node_modules/@nemi-fi/wallet-sdk/`
2. Edit the `package.json` file
3. Add the following `exports` field to the package.json:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  }
}
```

### Alternative Solution: Install patch-package

You can also use patch-package to automate this process:

1. Install patch-package: `npm install patch-package --save-dev`
2. Make the changes above to the package.json
3. Run: `npx patch-package @nemi-fi/wallet-sdk`
4. Add to your package.json scripts: `"postinstall": "patch-package"`

### Webpack Configuration

The next.config.js has been updated with additional webpack configuration to handle module resolution issues:

- Added module aliases for better resolution
- Added transpilePackages for the problematic package
- Enhanced resolve.fallback for Node.js modules

This should resolve the build issues you're experiencing with Vercel deployments. 