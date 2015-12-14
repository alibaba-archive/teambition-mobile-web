Teambition Mobile Web App(TMWA)
======================================

## global dependency
```
npm i -g gulp
npm i -g ionic
```
## Compile
```
gulp
```
## Build
```
gulp build
```
## Env variable
```
BUILD_TARGET=default/ding/wechat
```
undefined as default
```
BUILD_ENV=default/beta/release
```
undefined as default

## deployment
### DingDing in ci
```
npm run locald
```
### DingDing in beta
```
npm run betad
```
## startup
```
ionic serve
```
