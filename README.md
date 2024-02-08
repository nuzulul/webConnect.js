# webConnect.js
📶 Browser to browser connection without server

[![NPM](https://nodei.co/npm/webconnect.png?mini=true)](https://www.npmjs.com/package/webconnect)
[![npm version](https://badge.fury.io/js/webconnect.svg)](https://www.npmjs.com/package/webconnect)

webConnect.js over a browser to browser connection for static client side HTML, which is usually impossible. Previously, the solution available was using webRTC transport, which still required to setup a signaling server as a middleman. This library works by leveraging already established P2P networks, such as IPFS Network or Torrent Network for signaling. Now static web pages can talk to each other, even hosts on static hosting such as github pages, cloudflare pages, gitlab pages, netlify or localhost.

Demo : [https://nuzulul.github.io/webConnect.js/](https://nuzulul.github.io/webConnect.js/)

## Features

* ✅ Bypass NAT
* ✅ Bypass VPN

## Installation

NPM
```javascript
npm install webconnect

//Common JS 
const webconnect = require('webconnect')

//ES Module
import webconnect from 'webconnect'
```
CDN
```javascript
<script src="https://cdn.jsdelivr.net/npm/webconnect@0.0.3/dist/umd/webconnect.js"></script>
```
```javascript
<script type="module">import webconnect from 'https://cdn.jsdelivr.net/npm/webconnect@0.0.3/dist/esm/webconnect.js'</script>
```
## Get Started
### Initialization

```javascript
const connect = await webconnect({})
```
### Listen
Listen on new connect
```javascript
connect.onConnect((attribute) => console.log(`${attribute.connectId} connected`))
```
Listen on disconnect event
```javascript
connect.onDisconnect((attribute) => console.log(`${attribute.connectId} disconnected`))
```
Listen on receiving data
```javascript
connect.onReceive((data,attribute) => console.log(`${data} from ${attribute.connectId}`))
```
Listen on sending progress
```javascript
connect.onSendProgress((attribute) => console.log(`Sending progress : ${attribute.percent} to ${attribute.connectId}`))
```
Listen on receiving progress
```javascript
connect.onReceiveProgress((attribute) => console.log(`Receiving progress : ${attribute.percent} from ${attribute.connectId}`))
```
Listen on incoming streaming
```javascript
connect.onStreaming((stream,attribute) => Elements[attribute.connectId].video.srcObject = stream )
```
### Action
Get My Connection Id
```javascript
connect.getMyId((attribute) => console.log(`${attribute.connectId}`))
```
Send Data
```javascript
const attribute = {connectId}
connect.Send(data,attribute)
```
Send Binary
```javascript
const attribute = {connectId,metadata:{name: 'Report', type: 'application/pdf'}}
connect.Send(buffer,attribute)
```
Open Streaming
```javascript
const attribute = {connectId,metadata:{name:'Meeting'}}
connect.openStreaming(stream,attribute)
```
Close Streaming
```javascript
const attribute = {connectId}
connect.closeStreaming(stream,attribute)
```
Ping Connection
```javascript
const attribute = {connectId}
console.log(`${await connect.Ping(attribute)} ms`)
```
Disconnect
```javascript
connect.Disconnect()
```
Get All Connection Id
```javascript
connect.getConnection((attribute) => console.log(`${attribute.connection}`))
```
## Example
```javascript
<script type="module">
	import webconnect from 'https://cdn.jsdelivr.net/npm/webconnect@0.0.3/dist/esm/webconnect.js'
	
	const connect = webconnect({})
	connect.onConnect(async(attribute)=>{
		console.log("Connect",attribute)
		connect.Send("hello",{connectId:attribute.connectId})
		console.log(await connect.Ping({connectId:attribute.connectId}))
		connect.getConnection((attribute)=>{
			console.log("Connection",attribute)
		})
	})
	connect.onDisconnect((attribute)=>{
		console.log("Disconnect",attribute)
	})
	
	connect.onReceive((data,attribute) =>{
		console.log(data,attribute)
	})
</script>
```

## API

### Connect to a channel

```javascript
webconnect({appName,channelName,connectPassword,iceConfiguration})
```
options :
- appName - (String) Your app identity
- channelName - (String) Channel to connect
- connectPassword - (String) Password to encrypt connection initialization
- iceConfiguration - (Object) Custom [iceConfiguration](https://webrtc.org/getting-started/turn-server)

### Listen to every new connection

```javascript
onConnect((attribute)=>{})
```
- `attribute = {connectId}` - `connectId` is origin connection identity

### Listen to every disconnection

```javascript
onDisconnect((attribute)=>{})
```
- `attribute = {connectId}` - `connectId` is origin connection identity

### Send data to connection 

```javascript
Send(data,attribute)
```
- `data = String or Object`
- `attribute = {connectId}` - `connectId` is target connection can single `connectId` , multiple with array `[connectId,connectId,...]` or `null` to target all connection in the channel 

### Send binary data to connection

```javascript
Send(ArrayBuffer,attribute)
```
- `ArrayBuffer = Binary data`
- `attribute = {connectId,metadata}` - `connectId` is target connection can single `connectId` , multiple with array `[connectId,connectId,...]` or `null` to target all connection in channel - `metadata` is optional metadata object like filename or filetype

### Listen to sending progress for binary data

```javascript
onSendProgress((attribute) => {})
```
- `attribute = {percent,connectId}` - `percent` indicating the percentage between 0 and 1, `connectId` is target connection

### Listen to receiving data

```javascript
onReceive((data,attribute) => {})
```
- `data = String or Object or ArrayBuffer`
- `attribute = {connectId,metadata}` - `connectId` is origin connection identity - `metadata` is object description about the ArrayBuffer

### Listen to receiving progress for binary data

```javascript
onReceiveProgress((attribute) => {})
```
- `attribute = {percent,connectId}` - `percent` indicating the percentage between 0 and 1, `connectId` is origin connection identity

### Open streaming connection

```javascript
openStreaming(stream,attribute)
```
- `stream = MediaStream` - A `MediaStream` with audio and/or video 
- `attribute = {connectId, metadata}` - `connectId` is target connection - `metadata` is optional object stream description

### Listen to incoming streaming connection

```javascript
onStreaming((stream,attribute) => {})
```
- `stream = MediaStream` - A `MediaStream` with audio and/or video 
- `attribute = {connectId,metadata}` - `connectId` is origin connection identity - `metadata` is optional stream description

### Close streaming connection

```javascript
closeStreaming(stream,attribute)
```
- `stream = MediaStream` - A previously opened MediaStream
- `attribute = {connectId}` - `connectId` is target connection

### Get self connection identity

```javascript
getMyId((attribute) => {})
```
- `attribute = {connectId}` - `connectId` is self connection identity
### Get all connection identity in the channel

```javascript
getConnection((attribute) => {})
```
- `attribute = {connection}` - `connection` is Array of all connection identity exclude self connection identity

### Get latency of connection which return a promise that resolve to milliseconds

```javascript
Ping(attribute)
```
- `attribute = {connectId}` - `connectId` is target connection

### Disconnect from channel

```javascript
Disconnect()
```


## License

[MIT](https://github.com/nuzulul/webConnect.js/blob/main/LICENSE)