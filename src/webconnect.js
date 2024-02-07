import * as joinRoomTORRENT from 'trystero'
import * as joinRoomIPFS from 'trystero/ipfs'
import * as joinRoomMQTT from 'trystero/mqtt'

class webConnect{
	
	#connectpeers
	#DB
	#TORRENT
	#MQTT
	#IPFS 
	#torrentsendData
	#ipfssendData
	#mqttsendData
	#MyId
	
	constructor(connect){
		
		this.#connectpeers = []
		
		const db = connect.db
		const torrent = connect.room.roomTORRENT
		const ipfs = connect.room.roomIPFS
		const mqtt = connect.room.roomMQTT
		const MyId = connect.MyId
		
		this.#DB = db
		this.#TORRENT = torrent
		this.#MQTT = mqtt
		this.#IPFS = ipfs
		this.#MyId = MyId
		
		torrent.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "torrent",this.#onJoin);})
		ipfs.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "ipfs",this.#onJoin);})
		mqtt.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "mqtt",this.#onJoin);})

		torrent.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "torrent",this.#onLeave);})
		ipfs.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "ipfs",this.#onLeave);})
		mqtt.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "mqtt",this.#onLeave);})

		torrent.onPeerStream((stream,peerId)=>{this.#onconnectPeerStream(stream,peerId, "mqtt",this.#onStream);})
		ipfs.onPeerStream((stream,peerId)=>{this.#onconnectPeerStream(stream,peerId, "mqtt",this.#onStream);})
		mqtt.onPeerStream((stream,peerId)=>{this.#onconnectPeerStream(setream,peerId, "mqtt",this.#onStream);})
		
		const [torrentsendData, torrentgetData, torrentonDataProgress] = torrent.makeAction('data')
		this.#torrentsendData = torrentsendData
		torrentgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "torrent",this.#onGet))
		torrentonDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"torrent",this.#ReceiveProgress)})

		const [ipfssendData, ipfsgetData, ipfsonDataProgress] = ipfs.makeAction('data')
		this.#ipfssendData = ipfssendData
		ipfsgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "ipfs",this.#onGet))
		ipfsonDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"mqtt",this.#ReceiveProgress)})

		const [mqttsendData, mqttgetData, mqttonDataProgress] = mqtt.makeAction('data')
		this.#mqttsendData = mqttsendData
		mqttgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "mqtt",this.#onGet))
		mqttonDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"ipfs",this.#ReceiveProgress)})
		
		//this.#loopping()
		
	}
	
	#onconnectPeerJoin(peerId, protocol,callback){
		let peer ={id:peerId,engine:[protocol],online:{}}
		const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
		if(searchPeer == -1){
			this.#connectpeers.push(peer)
			let connectoutput = {connectId:peerId}
			callback(connectoutput)
		}else{
			let engine = this.#connectpeers[searchPeer].engine
			if(!engine.includes(protocol))this.#connectpeers[searchPeer].engine.push(protocol)
		}
		//this.#fping(peerId,protocol)
	}
	
	#onconnectPeerLeave(peerId, protocol,callback){
		const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
		if(searchPeer > -1){
			let engine = this.#connectpeers[searchPeer].engine
			const searchEngine = engine.findIndex((item) => item==protocol)
			if(searchEngine > -1){
				this.#connectpeers[searchPeer].engine.splice(searchEngine, 1)
				if(this.#connectpeers[searchPeer].engine.length == 0){
					this.#connectpeers.splice(searchPeer, 1)
					let connectoutput = {connectId:peerId}
					callback(connectoutput)
				}
			}
		}
	}
	
	#onconnectPeerStream(stream,peerId,protocol,callback){
		let connectoutput = {connectId:peerId}
		callback(stream,connectoutput)
	}
	
	#fsendData(protocol,payload,arrpeers,objmetadata){
		if(protocol !== "" && protocol != undefined){
			if(protocol == "torrent"){
				this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "torrent",this.#SendProgress);})
			}else if(protocol == "mqtt"){
				this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "mqtt",this.#SendProgress);})
			}else if(protocol == "ipfs"){
				this.#ipfssendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "ipfs",this.#SendProgress);})
			}
		}else{
			if(arrpeers != null&&Array.isArray(arrpeers)){
				for(const id of arrpeers){
					const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==id)
					if(searchPeer > -1){
						let engine = this.#connectpeers[searchPeer].engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("ipfs")){
							this.#ipfssendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "ipfs",this.#SendProgress);})
						}
					}
					
				}
			}else if(arrpeers != null&&typeof arrpeers === 'string'){
					const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==arrpeers)
					if(searchPeer > -1){
						let engine = this.#connectpeers[searchPeer].engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("ipfs")){
							this.#ipfssendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "ipfs",this.#SendProgress);})
						}
					}
					
			
			}else{
				if(payload == "webconnectping"){
					this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "torrent",this.#SendProgress);})
					this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "mqtt",this.#SendProgress);})
					this.#ipfssendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "ipfs",this.#SendProgress);})
				}else{
					this.#connectpeers.forEach((peer,index)=>{
						let engine = peer.engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("ipfs")){
							this.#ipfssendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId, "ipfs",this.#SendProgress);})
						}
					})
				}
			}
		}
	}
	
	#onconnectSendProggress(percent, peerId,protocol,callback){
		let connectoutput = {percent,connectId:peerId}
		callback(connectoutput)
	}
	
	#onconnectReceiveProggress(percent, peerId, metadata,protocol,callback){
		let connectoutput = {percent,connectId:peerId,metadata}
		callback(connectoutput)
	}
	
	#fgetData(data, peerId, metadata,protocol,callback){
		if(data=="webconnectping"){
			this.#fpong(peerId,protocol)			
		}else if(data=="webconnectpong"){
			const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
			if(searchPeer > -1){
				const d = new Date()
				let time = d.getTime()
				if(protocol == "torrent"){
					this.#connectpeers[searchPeer].online.torrent = time
				}else if(protocol == "mqtt"){
					this.#connectpeers[searchPeer].online.mqtt = time
				}else if(protocol == "ipfs"){
					this.#connectpeers[searchPeer].online.ipfs = time
				}
			}
		}else{
			let connectoutput = {connectId:peerId,metadata}
			callback(data, connectoutput)
		}
	}
	
	#fping(peerId,protocol){
		
		this.#fsendData(protocol,"webconnectping",peerId)
	}
	
	#fpong(peerId,protocol){
		
		this.#fsendData(protocol,"webconnectpong",peerId)
	}
	
	#loopping(){
		let timerId = setInterval(() => {
			this.#fping(null)
			const d = new Date()
			let time = d.getTime()
			this.#connectpeers.forEach((peer,idx1)=>{
				peer.engine.forEach((protocol,idx2)=>{
					let limit = 30*1000
					if(time - peer.online[protocol] > limit){
						this.#connectpeers[idx1].engine.splice(idx2, 1)
					}
				})
			})
		}, 10000);
	}
	
	#onJoin = () => {}	
	onConnect = f => (this.#onJoin = f)

	#onLeave = () => {}	
	onDisconnect = f => (this.#onLeave = f)
	
	Send(data,metadata){
		this.#fsendData("",data,metadata.connectId,metadata.metadata)
	}
	
	#onGet = () => {}
	onReceive = f => (this.#onGet = f)

	#SendProgress = () => {}
	onSendProgress = f => (this.#SendProgress = f)

	#ReceiveProgress = () => {}
	onReceiveProgress = f => (this.#ReceiveProgress = f)
	
	openStreaming(stream,metadata){
		let peerId = metadata.connectId
		if(peerId == null){
			this.#connectpeers.forEach((peer,index)=>{
				let engine = peer.engine
				if(engine.includes("torrent")){
					this.#TORRENT.addStream(stream, peer.id)
				}
				else if (engine.includes("mqtt")){
					this.#MQTT.addStream(stream, peer.id)
				}
				else if (engine.includes("ipfs")){
					this.#IPFS.addStream(stream, peer.id)
				}
			})
		}else{
			const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
			if(searchPeer > -1){
				let engine = this.#connectpeers[searchPeer].engine
				if(engine.includes("torrent")){
					this.#TORRENT.addStream(stream, peerId)
				}
				else if (engine.includes("mqtt")){
					this.#MQTT.addStream(stream, peerId)
				}
				else if (engine.includes("ipfs")){
					this.#IPFS.addStream(stream, peerId)
				}
			}
		}
	}

	#onStream = () => {}
	onStreaming = f => (this.#onStream = f)
	
	closeStreaming(stream,metadata){
		let peerId = metadata.connectId
		if(peerId == null){
			this.#connectpeers.forEach((peer,index)=>{
				let engine = peer.engine
				engine.forEach((protocol,idx)=>{
						if(protocol == "torrent")this.#TORRENT.removeStream(stream, peer.id)
						if(protocol == "mqtt")this.#MQTT.removeStream(stream, peer.id)
						if(protocol == "ipfs")this.#IPFS.removeStream(stream, peer.id)
				})
			})	
		}else if(typeof peerId === 'string'){
			const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
			if(searchPeer > -1){
				let engine = this.#connectpeers[searchPeer].engine
				if(engine.includes("torrent")){
					this.#TORRENT.addStream(stream, peerId)
				}
				else if (engine.includes("mqtt")){
					this.#MQTT.addStream(stream, peerId)
				}
				else if (engine.includes("ipfs")){
					this.#IPFS.addStream(stream, peerId)
				}
			}
		}
	}
	
	async Ping(metadata){
		let peerId = metadata.connectId
		if(peerId == null){
			return null
		}else if(typeof peerId === 'string'){
			const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
			if(searchPeer > -1){
				let engine = this.#connectpeers[searchPeer].engine
				if(engine.includes("torrent")){
					return await this.#TORRENT.ping(peerId)
				}
				else if (engine.includes("mqtt")){
					return await this.#MQTT.ping(peerId)
				}
				else if (engine.includes("ipfs")){
					return await this.#IPFS.ping(peerId)
				}
			}
			
		}else{
			return []
		}
		
	}
	
	Disconnect(){
		if(Object.keys(this.#TORRENT.getPeers()).length !== 0)this.#TORRENT.leave()
		if(Object.keys(this.#MQTT.getPeers()).length !== 0)this.#MQTT.leave()
		if(Object.keys(this.#IPFS.getPeers()).length !== 0)this.#IPFS.leave()
	}

	getConnection(f){
		let data = []
		this.#connectpeers.forEach((peer,index)=>{
			data.push(peer.id)
		})
		let output = {connection:data}
		f(output)
	}
	
	getMyId(f){
		let output = {connectId:this.#MyId}
		f(output)
	}
	
}

export function webconnect({
			appName = "webConnect",
			channelName = "webConnectChannel",
			connectPassword = "Browser to browser connection without server",
			iceConfiguration = {
				iceServers: [
					{
						urls: 'turn:numb.viagenie.ca',
						credential: 'myturn33',
						username: 'hxuwb10o@anonaddy.me',
					},
					{
						urls: "stun:stun.relay.metered.ca:80",
					},
					{
						urls: "turn:standard.relay.metered.ca:80",
						username: "ffe6b198c8c1b398859ab8f8",
						credential: "ijdB5Sq20DElg7CF",
					},
					{
						urls: "turn:standard.relay.metered.ca:80?transport=tcp",
						username: "ffe6b198c8c1b398859ab8f8",
						credential: "ijdB5Sq20DElg7CF",
					},
					{
						urls: "turn:standard.relay.metered.ca:443",
						username: "ffe6b198c8c1b398859ab8f8",
						credential: "ijdB5Sq20DElg7CF",
					},
					{
						urls: "turns:standard.relay.metered.ca:443?transport=tcp",
						username: "ffe6b198c8c1b398859ab8f8",
						credential: "ijdB5Sq20DElg7CF",
					},
			  ]
			}
}){

	const config = {appId: appName,password:connectPassword,rtcConfig:iceConfiguration}
	
	const roomTORRENT = joinRoomTORRENT.joinRoom(config, channelName)
	
	const roomIPFS = joinRoomIPFS.joinRoom(config, channelName)
	
	const roomMQTT = joinRoomMQTT.joinRoom(config, channelName)

	const db = false

	const MyId = joinRoomTORRENT.selfId || joinRoomMQTT.selfId || joinRoomMQTT.selfId
	
	const connect = {db:db,room:{
		roomTORRENT,
		roomIPFS,
		roomMQTT
	},MyId}

	return new webConnect(connect)
}

export default webconnect