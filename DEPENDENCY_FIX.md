# Dependency Conflict Resolution

## Problem
The deployment was failing due to a conflict between viem versions required by different packages:

- **Aztec packages** (`@aztec/aztec.js`, `@aztec/accounts`) require `viem@2.23.7`
- **Privy** requires `viem@^2.28.1` (through permissionless dependency)
- Original `package.json` had `viem: "^2.0.0"`

Error message:
```
npm error ERESOLVE could not resolve
npm error Could not resolve dependency:
npm error @privy-io/react-auth@"^1.69.0" from the root project
npm error Conflicting peer dependency: viem@2.30.6
```

## Solution

### 1. Fixed Aztec Version Pinning
Changed from `"latest"` to specific stable version `"0.76.4"` for:
- `@aztec/aztec.js`
- `@aztec/accounts` 
- `@aztec/types`

**Note**: Version `0.87.5` was initially tried but doesn't exist. The latest available version is `0.76.4`.

### 2. Updated Viem Version
Set `viem` to `"2.30.6"` which satisfies both Aztec and Privy requirements.

### 3. Added Override/Resolution Configurations
Added to `package.json`:
```json
{
  "overrides": {
    "viem": "2.30.6"
  },
  "resolutions": {
    "viem": "2.30.6"
  }
}
```

### 4. Created `.npmrc` Configuration
Added `.npmrc` with:
```
legacy-peer-deps=true
auto-install-peers=true
```

### 5. Updated Vercel Configuration
Modified `vercel.json` to use `--legacy-peer-deps` flag during installation:
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

## Testing
To test locally:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Verify no dependency conflicts
4. Run `npm run build` to ensure build succeeds

## Future Updates
When updating dependencies:
1. Check compatibility between Aztec and Privy versions
2. Update viem version if needed to satisfy both
3. Test deployment on Vercel before pushing to main branch
4. Check available versions on npm before pinning specific versions 