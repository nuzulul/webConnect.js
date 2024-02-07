# webConnect.js
📶 Browser to browser connection without server

[![NPM](https://nodei.co/npm/webconnect.png?mini=true)](https://www.npmjs.com/package/webconnect)
[![npm version](https://badge.fury.io/js/webconnect.svg)](https://www.npmjs.com/package/webconnect)

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
<script src="https://cdn.jsdelivr.net/npm/webconnect@0.0.2/dist/umd/webconnect.js"></script>
```
```javascript
<script type="module">import webconnect from 'https://cdn.jsdelivr.net/npm/webconnect@0.0.2/dist/esm/webconnect.js'</script>
```
## Get Started
### Initialization

```javascript
const connect = await webconnect({})
```
### Listen
Listen on new connect
```javascript
connect.onConnect((metadata) => console.log(`${metadata.connectId} connected`))
```
Listen on disconnect event
```javascript
connect.onDisconnect((metadata) => console.log(`${metadata.connectId} disconnected`))
```
Listen on receiving data
```javascript
connect.onReceive((data,metadata) => console.log(`${data} from ${metadata}`))
```
Listen on sending progress
```javascript
connect.onSendProgress((metadata) => console.log(`Sending progress : ${metadata}`))
```
Listen on receiving progress
```javascript
connect.onReceiveProgress((metadata) => console.log(`Receiving progress : ${metadata}`))
```
Listen on incoming streaming
```javascript
connect.onStreaming((stream,metadata) => video.srcObject = stream )
```
### Action
Get My Connection Id
```javascript
connect.getMyId((metadata) => console.log(`${metadata}`))
```
Send Data
```javascript
connect.Send('data',{connectId})
```
Send Binary
```javascript
connect.Send(ArrayBuffer,{connectId,metadata:{name: 'Report', type: 'application/pdf'}})
```
Open Streaming
```javascript
connect.openStreaming(stream,{connectId})
```
Close Streaming
```javascript
connect.closeStreaming(stream,{connectId})
```
Ping Connection
```javascript
console.log(`${await connect.Ping({connectId})} ms`)
```
Disconnect
```javascript
connect.Disconnect()
```
Get All Connection Id
```javascript
connect.getConnection((metadata) => console.log(`${metadata}`))
```
## Example
```javascript
<script type="module">
	import webconnect from 'https://cdn.jsdelivr.net/npm/webconnect@0.0.2/dist/esm/webconnect.js'
	
	const connect = webconnect({
		appName:"myApp"
	})
	connect.onConnect(async(data)=>{
		console.log(data)
		connect.Send("hello",{connectId:data.connectId})
		console.log(await connect.Ping({connectId:data.connectId}))
		connect.getConnection((data)=>{
			console.log(data)
		})
	})
	connect.onDisconnect((data)=>{
		console.log(data)
	})
	
	connect.onReceive((data,metadata) =>{
		console.log(data,metadata)
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
- connectPassword - (String) Password to encrypt connection pairing
- iceConfiguration - (Object) Custom [iceConfiguration](https://webrtc.org/getting-started/turn-server)

### Listen to every new connection

```javascript
onConnect((metadata)=>{})
```
- `metadata = {connectId}` - `connectId` is connection identity

### Listen to every disconnection

```javascript
onDisconnect((metadata)=>{})
```
- `metadata = {connectId}` - `connectId` is connection identity

### Send data to connection 

```javascript
Send(data,metadata)
```
- `data = String or Object`
- `metadata = {connectId}` - `connectId` is target connection can single `connectId` , multiple with array `[connectId,connectId,...]` or `null` to all connection in channel 

### Send binary data to connection

```javascript
Send(ArrayBuffer,metadata)
```
- `ArrayBuffer = Binary data`
- `metadata = {connectId}` - `connectId` is target connection can single `connectId` , multiple with array `[connectId,connectId,...]` or `null` to all connection in channel

### Listen to sending progress for binary data

```javascript
onSendProgress((metadata) => {})
```
- `metadata = {percent,connectId}` - `percent` indicating the percentage between 0 and 1, `connectId` is target connection

### Listen to receiving data

```javascript
onReceive((data,metadata) => {})
```
- `data = String or Object`
- `metadata = {connectId}` - `connectId` is connection identity

### Listen to receiving progress for binary data

```javascript
onReceiveProgress((metadata) => {})
```
- `metadata = {percent,connectId}` - `percent` indicating the percentage between 0 and 1, `connectId` is connection identity

### Open streaming connection

```javascript
openStreaming(stream,metadata)
```
- `stream` = A `MediaStream` with audio and/or video 
- `metadata = {connectId}` - `connectId` is target connection

### Listen to incoming streaming connection

```javascript
onStreaming((stream,metadata) => {})
```
- `stream` = A `MediaStream` with audio and/or video 
- `metadata = {connectId}` - `connectId` is connection identity

### Get self connection identity

```javascript
getMyId((metadata) => {})
```
- `metadata = {connectId}` - `connectId` is self connection identity
### Get all connection identity in the channel

```javascript
getConnection((metadata) => {})
```
- `metadata = {connection}` - `connection` is Array of all connection identity

### Get latency of connection which return a promise that resolve to milliseconds

```javascript
Ping(metadata)
```
- `metadata = {connectId}` - `connectId` is target connection

### Disconnect from channel

```javascript
Disconnect()
```


## License

[MIT](https://github.com/nuzulul/webConnect.js/blob/main/LICENSE)