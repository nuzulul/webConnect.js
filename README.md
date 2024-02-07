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
const connect = await webconnect({
	//appName,
	//channelName,
	//connectPassword,
	//iceConfiguration
})
```
### Listen
Listen on new connect
```javascript
connect.onConnect(data => console.log(`${data.connectId} connected`))
```
Listen on disconnect event
```javascript
connect.onDisconnect(data => console.log(`${data.connectId} disconnected`))
```
Listen on receiving data
```javascript
connect.onReceive((data,metadata) => console.log(`${data} from ${metadata}`))
```
Listen on sending progress
```javascript
connect.onSendProgress(data => console.log(`Sending progress : ${data}`))
```
Listen on receiving progress
```javascript
connect.onReceiveProgress(data => console.log(`Receiving progress : ${data}`))
```
Listen on incoming streaming
```javascript
connect.onReceiveProgress((stream,metadata) => video.srcObject = stream )
```
### Action
Get My Connection Id
```javascript
console.log(`MyId : ${connect.MyId}`)
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
connect.openStreaming(stream,{connectId,metadata:{name:'Meeting'}})
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
connect.getConnection(data => console.log(`${data}`))
```
## Example
```javascript
<script type="module">
	import webconnect from 'https://cdn.jsdelivr.net/npm/webconnect@0.0.2/dist/esm/webconnect.js'
	
	const connect = webconnect({})
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
## License

[MIT](https://github.com/nuzulul/webConnect.js/blob/main/LICENSE)