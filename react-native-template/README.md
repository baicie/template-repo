# React Native Template

Native React Native template created with React Native CLI. It includes the generated Android and iOS projects plus TypeScript, pnpm, ESLint, Prettier, Jest, Git hooks, GitHub Actions, and project-level AI agent conventions.

## Quick Start

```bash
pnpm install
pnpm start
```

Run on a target:

```bash
pnpm android
pnpm ios
```

For iOS, install CocoaPods dependencies on macOS:

```bash
bundle install
bundle exec pod install --project-directory=ios
```

## Quality Commands

```bash
pnpm type-check
pnpm lint
pnpm format
pnpm test
pnpm check
```

## Project Structure

```text
react-native-template/
|-- .agents/skills/          # Project-level AI skills
|-- .github/workflows/ci.yml # Template CI
|-- android/                 # Native Android project
|-- ios/                     # Native iOS project
|-- scripts/                 # Local automation
|-- __tests__/               # Jest tests
|-- AGENTS.md                # AI collaboration guide
|-- App.tsx                  # App root
|-- app.json                 # React Native app config
|-- eslint.config.mjs        # ESLint flat config
`-- package.json
```

## Notes

- This template targets React Native 0.86.
- Keep native project edits intentional and documented.
- Run the root repository `node scripts/install-skills.js` when project-level skills need to be refreshed.

## Release Workflow

Pushing a tag like `v1.0.0` triggers `.github/workflows/release.yml`.

Android secrets:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded release keystore.
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

If Android signing secrets are not set, the template falls back to the generated debug keystore so the workflow can still produce an APK during early setup.

iOS secrets:

- `IOS_CERTIFICATE_BASE64`: base64-encoded `.p12` signing certificate.
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISION_PROFILE_BASE64`: base64-encoded provisioning profile.
- `IOS_TEAM_ID`
- `IOS_BUNDLE_IDENTIFIER`: optional, defaults to `org.reactjs.native.example.ReactNativeTemplate`.
- `IOS_EXPORT_METHOD`: optional, defaults to `app-store`.
- `KEYCHAIN_PASSWORD`: optional temporary keychain password.

The workflow builds:

- `react-native-template-vx.y.z.apk`
- `react-native-template-vx.y.z.ipa`
