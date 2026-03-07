# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.2.0 (2026-03-07)


### ⚠ BREAKING CHANGES

* rename project `shorl` to `irl` (#13)

### Features

* **api:** move shortener code to `/api/insert` POST endpoint ([#13](https://github.com/alessandromalacarne/shorl/issues/13)) ([aa60184](https://github.com/alessandromalacarne/shorl/commit/aa6018438609e7ae292e5294650a0cbe7f8c70d6))
* **aws:** create main lambda function ([#1](https://github.com/alessandromalacarne/shorl/issues/1)) ([c579253](https://github.com/alessandromalacarne/shorl/commit/c579253cf315d5c1b6df7e44912c243fe2fa3b04))
* **aws:** move aws implementation to `infra/` ([6cde246](https://github.com/alessandromalacarne/shorl/commit/6cde246952c379858a0a94e49ec8847a57c9c8f7))
* **aws:** setup env variables for region and account ([00b4355](https://github.com/alessandromalacarne/shorl/commit/00b43555f354fa548ab5884e578646a691626147))
* create `npm run dev` and `npm run prod` ([#29](https://github.com/alessandromalacarne/shorl/issues/29)) ([d6ed3e7](https://github.com/alessandromalacarne/shorl/commit/d6ed3e734dc0f9d2080c7de42d92d55af8ec02ff))
* **dev:** add `AGENTS.md` ([a1499b5](https://github.com/alessandromalacarne/shorl/commit/a1499b5778828c68825a95eff26b12847c7c21c4))
* **infra:** create minimal CORS configuration ([#24](https://github.com/alessandromalacarne/shorl/issues/24)) ([b79acca](https://github.com/alessandromalacarne/shorl/commit/b79accacd97a4218b795449490f37426c8c6504d))
* **infra:** point lambda function to `web/.output/server` ([#12](https://github.com/alessandromalacarne/shorl/issues/12)) ([0388cb5](https://github.com/alessandromalacarne/shorl/commit/0388cb537d3d4bfcb5f4045771af9685df95e74b))
* rename project `shorl` to `irl` ([#13](https://github.com/alessandromalacarne/shorl/issues/13)) ([abdd4c6](https://github.com/alessandromalacarne/shorl/commit/abdd4c6a5f62894408a7cc9f1ad775bb2aaa694f))
* **web.server:** create `server/api` ([#13](https://github.com/alessandromalacarne/shorl/issues/13)) ([6abb1ea](https://github.com/alessandromalacarne/shorl/commit/6abb1ea08eddc1b6da76e0b3d30430569f0b2a24))
* **web:** add basic url input validation ([#11](https://github.com/alessandromalacarne/shorl/issues/11)) ([0bedff9](https://github.com/alessandromalacarne/shorl/commit/0bedff908dab693b8592cfed8e072c41be5b9206))
* **web:** consume internal api to get shortened url ([#13](https://github.com/alessandromalacarne/shorl/issues/13)) ([b3cd32d](https://github.com/alessandromalacarne/shorl/commit/b3cd32da6392d1fa5aa7980c411001a50d1c46fe))
* **web:** create input for user url ([#3](https://github.com/alessandromalacarne/shorl/issues/3)) ([acf4eb4](https://github.com/alessandromalacarne/shorl/commit/acf4eb48a77fecce6aab3eb8b4b95d747927e967))
* **web:** create shortener POC ([#11](https://github.com/alessandromalacarne/shorl/issues/11)) ([f2d6296](https://github.com/alessandromalacarne/shorl/commit/f2d6296f20559a368e93bbd8199999a0b584fa62))
* **web:** redirect user to shortened page ([#11](https://github.com/alessandromalacarne/shorl/issues/11)) ([6803113](https://github.com/alessandromalacarne/shorl/commit/6803113ce42c4fa4f42e7d11d0e1c29250c271d8))
* **web:** run nuxt create ([#3](https://github.com/alessandromalacarne/shorl/issues/3)) ([1e77897](https://github.com/alessandromalacarne/shorl/commit/1e778976ee2b971bcfe45e9c83112739e1324468))
* **web:** use `apiUrl` variable at code ([#29](https://github.com/alessandromalacarne/shorl/issues/29)) ([71d19b8](https://github.com/alessandromalacarne/shorl/commit/71d19b8fc0017955f2c32c3a089fca244fc1c9c0))


### Bug Fixes

* remove useless `bin/` and `lib/` from home ([9a85e85](https://github.com/alessandromalacarne/shorl/commit/9a85e85348d1128be2081a2fd5b1bd80764a2bcc))
* **web.api:** avoid duplicated bar on URL ([d8965b6](https://github.com/alessandromalacarne/shorl/commit/d8965b6161cb4e7819059c02aba5f2a0f4ea3227))
* **web.config:** add missing bar to default `apiUrl` ([10e92b4](https://github.com/alessandromalacarne/shorl/commit/10e92b4de2344202e9a00b7bbad34be6849da5c0))
* **web:** fix typescript building by changing import/type lines ([#12](https://github.com/alessandromalacarne/shorl/issues/12)) ([8950068](https://github.com/alessandromalacarne/shorl/commit/8950068abfab67cabb7f0d1332e8dbe21c5d6625))


### Refactoring

* **aws:** move lambda function to `./src/index.ts` ([3b9dd4b](https://github.com/alessandromalacarne/shorl/commit/3b9dd4bc737249be6b131cb5a6981fd91efb3b99))
* **web:** move shortener stub to `composable/shortener.ts` ([8511913](https://github.com/alessandromalacarne/shorl/commit/85119139bb0298ae8571cdfd295a6d331027e7fa))


### Documentation

* remove comment saying that `FunctionUrlAuthType.NONE` is insecure ([348c7bd](https://github.com/alessandromalacarne/shorl/commit/348c7bd6f4d3e6a2997cf203f2edbb1669c1d032))


### Maintenance

* add `web/dist` and `web/.env` to .gitignore ([f43accc](https://github.com/alessandromalacarne/shorl/commit/f43acccca66e6ad17a94c33003f84d855beebbf4))
* **git:** add `web/.nuxt` to .gitignore ([d7cc45b](https://github.com/alessandromalacarne/shorl/commit/d7cc45b9a90bd89761f9f85b9787632b0c1c2c11))
* **infra:** add `infra/cdk-outputs.json` to .gitignore ([2f54ee1](https://github.com/alessandromalacarne/shorl/commit/2f54ee152d0b27c5f0b7c8a7c28b5c3ce36aeb06))
* remove `web/.output` from repository ([e172937](https://github.com/alessandromalacarne/shorl/commit/e17293720de0e869e1118aaf8f4e42c403073a04))
* **web:** remove no-effect nuxt config ([5b715ea](https://github.com/alessandromalacarne/shorl/commit/5b715ea53805a6e48b578456cc7a2cbade797289))
* **web:** remove nuxt `README.md` ([2780728](https://github.com/alessandromalacarne/shorl/commit/278072880e8f769a7c9fffc8eab8741761f9226a))


### Tests

* **infra:** replace jest with vitest ([19db707](https://github.com/alessandromalacarne/shorl/commit/19db707a00e2895c4c9fb163dc79b60403091ea5))
* **web:** create api insert tests ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([60bb12a](https://github.com/alessandromalacarne/shorl/commit/60bb12a415bc1537551483329357a37d2f74d225))
* **web:** create api redirect tests ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([ad60810](https://github.com/alessandromalacarne/shorl/commit/ad608109fe745c3931a80f6064ffe363d0ed3a1a))
* **web:** create index page tests ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([d945fe2](https://github.com/alessandromalacarne/shorl/commit/d945fe24363f951e9120420a9558397980dbf452))


### Build System

* **aws:** run `cdk init` ([#1](https://github.com/alessandromalacarne/shorl/issues/1)) ([581f8dc](https://github.com/alessandromalacarne/shorl/commit/581f8dc4e78f4aab66f866ebc20c04e0bd2819f0))
* create `build` and `prod` scripts ([#29](https://github.com/alessandromalacarne/shorl/issues/29)) ([a9ee9ee](https://github.com/alessandromalacarne/shorl/commit/a9ee9ee8184250a92eb504d637b33f1655d990d1))
* **dev:** configure husky for sematic release automation and commit hooks ([a0b4875](https://github.com/alessandromalacarne/shorl/commit/a0b487522395d04f06a0307262d0da9b2dbed788))
* **infra:** get `API_URL` from `cdk-outputs.json` ([#29](https://github.com/alessandromalacarne/shorl/issues/29)) ([cade013](https://github.com/alessandromalacarne/shorl/commit/cade01309e34d8152a378af5b135ea6c5ea52e62))
* install `vitest` and `commitlint` globally, remove jest ([20b3357](https://github.com/alessandromalacarne/shorl/commit/20b3357d6ef8a55e33f2e61b63b0ff05871bf3d1))
* **nix:** create flake.nix and install `typescript` ([7ff4aeb](https://github.com/alessandromalacarne/shorl/commit/7ff4aeb663c27c1602687940893bb97d6f6584f9))
* **nixos:** create `flake.nix` with some of necessary packages ([eabf832](https://github.com/alessandromalacarne/shorl/commit/eabf83203916b9bd9d294199261a77d1345daa86))
* setup basic `package.json` for `aws-cdk` ([#1](https://github.com/alessandromalacarne/shorl/issues/1)) ([e22ec61](https://github.com/alessandromalacarne/shorl/commit/e22ec61a96a5f98dc876c3123fb17dc4314a979b))
* **web.config:** create `vitest` config ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([810a410](https://github.com/alessandromalacarne/shorl/commit/810a41070ca96f8cf5b20ca4800e76a3c4c57f21))
* **web:** add `nanoid` package ([#11](https://github.com/alessandromalacarne/shorl/issues/11)) ([8ef54bb](https://github.com/alessandromalacarne/shorl/commit/8ef54bb2ac5f240a5cdc520a9889115ff97b7acc))
* **web:** add `vitest`, `happy-dom` and test scripts ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([658bc9a](https://github.com/alessandromalacarne/shorl/commit/658bc9ac1d30bae6749276d2d7dd67aab6db27cb))
* **web:** create stubs for nuxt ([#26](https://github.com/alessandromalacarne/shorl/issues/26)) ([3aae7ff](https://github.com/alessandromalacarne/shorl/commit/3aae7ff629eae81e6c1dbc5414b69f55e0d1d65c))
* **web:** enable `aws-lambda` preset for nitro ([#12](https://github.com/alessandromalacarne/shorl/issues/12)) ([60da0bf](https://github.com/alessandromalacarne/shorl/commit/60da0bfe085a9ca13cb7a0e715845c8cffff3476))
* **web:** install axios package ([db646e4](https://github.com/alessandromalacarne/shorl/commit/db646e4be3e226c32a8fe3ff055969bd9c0b6a9b))
* **web:** make `apiUrl` public, with default value ([#29](https://github.com/alessandromalacarne/shorl/issues/29)) ([e3f7481](https://github.com/alessandromalacarne/shorl/commit/e3f7481cd918c43d52f794f74683efeba9e318e7))
* **web:** omit `.nuxt` from repository ([b59a035](https://github.com/alessandromalacarne/shorl/commit/b59a035a59a2b7301cceb4ed3f8bedd9219fa540))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

## [MAJOR.MINOR.PATCH] - YYYY-MM-DD

### Features

### Bug Fixes

### Performance

### Refactoring

### Documentation

### Tests

### Build System

### CI/CD

### Maintenance
