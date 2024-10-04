import * as joinRoomTORRENT from 'trystero'
import * as joinRoomNOSTR from 'trystero/nostr'
import * as joinRoomMQTT from 'trystero/mqtt'

class webConnect{
	
	#connectpeers
	#DB
	#TORRENT
	#MQTT
	#NOSTR 
	#torrentsendData
	#nostrsendData
	#mqttsendData
	#MyId
	
	constructor(connect){
		
		this.#connectpeers = []
		
		const db = connect.db
		const torrent = connect.room.roomTORRENT
		const nostr = connect.room.roomNOSTR
		const mqtt = connect.room.roomMQTT
		const MyId = connect.MyId
		
		this.#DB = db
		this.#TORRENT = torrent
		this.#MQTT = mqtt
		this.#NOSTR = nostr
		this.#MyId = MyId
		
		torrent.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "torrent",this.#onJoin);})
		nostr.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "nostr",this.#onJoin);})
		mqtt.onPeerJoin((peerId)=>{this.#onconnectPeerJoin(peerId, "mqtt",this.#onJoin);})

		torrent.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "torrent",this.#onLeave);})
		nostr.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "nostr",this.#onLeave);})
		mqtt.onPeerLeave((peerId)=>{this.#onconnectPeerLeave(peerId, "mqtt",this.#onLeave);})

		torrent.onPeerStream((stream,peerId,metadata)=>{this.#onconnectPeerStream(stream,peerId,metadata, "torrent",this.#onStream);})
		nostr.onPeerStream((stream,peerId,metadata)=>{this.#onconnectPeerStream(stream,peerId,metadata, "nostr",this.#onStream);})
		mqtt.onPeerStream((stream,peerId,metadata)=>{this.#onconnectPeerStream(setream,peerId,metadata, "mqtt",this.#onStream);})
		
		const [torrentsendData, torrentgetData, torrentonDataProgress] = torrent.makeAction('data')
		this.#torrentsendData = torrentsendData
		torrentgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "torrent",this.#onGet))
		torrentonDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"torrent",this.#ReceiveProgress)})

		const [nostrsendData, nostrgetData, nostronDataProgress] = nostr.makeAction('data')
		this.#nostrsendData = nostrsendData
		nostrgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "nostr",this.#onGet))
		nostronDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"mqtt",this.#ReceiveProgress)})

		const [mqttsendData, mqttgetData, mqttonDataProgress] = mqtt.makeAction('data')
		this.#mqttsendData = mqttsendData
		mqttgetData((data, peerId, metadata) => this.#fgetData(data, peerId, metadata, "mqtt",this.#onGet))
		mqttonDataProgress((percent, peerId, metadata) => {this.#onconnectReceiveProggress(percent, peerId, metadata,"nostr",this.#ReceiveProgress)})
		
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
	
	#onconnectPeerStream(stream,peerId,metadata,protocol,callback){
		let connectoutput = {connectId:peerId,metadata}
		callback(stream,connectoutput)
	}
	
	#fsendData(protocol,payload,arrpeers,objmetadata){
		if(protocol !== "" && protocol != undefined){
			if(protocol == "torrent"){
				this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "torrent",this.#SendProgress);})
			}else if(protocol == "mqtt"){
				this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "mqtt",this.#SendProgress);})
			}else if(protocol == "nostr"){
				this.#nostrsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "nostr",this.#SendProgress);})
			}
		}else{
			if(arrpeers != null&&Array.isArray(arrpeers)){
				for(const id of arrpeers){
					const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==id)
					if(searchPeer > -1){
						let engine = this.#connectpeers[searchPeer].engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("nostr")){
							this.#nostrsendData(payload,id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "nostr",this.#SendProgress);})
						}
					}
					
				}
			}else if(arrpeers != null&&typeof arrpeers === 'string'){
					const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==arrpeers)
					if(searchPeer > -1){
						let engine = this.#connectpeers[searchPeer].engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("nostr")){
							this.#nostrsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "nostr",this.#SendProgress);})
						}
					}
					
			
			}else{
				if(payload == "webconnectping"){
					this.#torrentsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "torrent",this.#SendProgress);})
					this.#mqttsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "mqtt",this.#SendProgress);})
					this.#nostrsendData(payload,arrpeers,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "nostr",this.#SendProgress);})
				}else{
					this.#connectpeers.forEach((peer,index)=>{
						let engine = peer.engine
						if(engine.includes("torrent")){
							this.#torrentsendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "torrent",this.#SendProgress);})
						}
						else if (engine.includes("mqtt")){
							this.#mqttsendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "mqtt",this.#SendProgress);})
						}
						else if (engine.includes("nostr")){
							this.#nostrsendData(payload,peer.id,objmetadata,(percent, peerId)=>{this.#onconnectSendProggress(percent,peerId,objmetadata, "nostr",this.#SendProgress);})
						}
					})
				}
			}
		}
	}
	
	#onconnectSendProggress(percent, peerId,metadata,protocol,callback){
		let connectoutput = {percent,connectId:peerId,metadata}
		callback(connectoutput)
	}
	
	#onconnectReceiveProggress(percent, peerId, metadata,protocol,callback){
		let connectoutput = {percent,connectId:peerId,metadata}
		callback(connectoutput)
	}
	
	#fgetData(data, peerId, metadata,protocol,callback){
		if(metadata == undefined){
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
					}else if(protocol == "nostr"){
						this.#connectpeers[searchPeer].online.nostr = time
					}
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
	
	Send(data,attribute){
		this.#fsendData("",data,attribute.connectId,attribute.metadata)
	}
	
	#onGet = () => {}
	onReceive = f => (this.#onGet = f)

	#SendProgress = () => {}
	onSendProgress = f => (this.#SendProgress = f)

	#ReceiveProgress = () => {}
	onReceiveProgress = f => (this.#ReceiveProgress = f)
	
	openStreaming(stream,attribute){
		let peerId = attribute.connectId
		let metadata = attribute.metadata
		if(peerId == null){
			this.#connectpeers.forEach((peer,index)=>{
				let engine = peer.engine
				if(engine.includes("torrent")){
					this.#TORRENT.addStream(stream, peer.id, metadata)
				}
				else if (engine.includes("mqtt")){
					this.#MQTT.addStream(stream, peer.id, metadata)
				}
				else if (engine.includes("nostr")){
					this.#NOSTR.addStream(stream, peer.id, metadata)
				}
			})
		}else{
			const searchPeer = this.#connectpeers.findIndex((peer) => peer.id==peerId)
			if(searchPeer > -1){
				let engine = this.#connectpeers[searchPeer].engine
				if(engine.includes("torrent")){
					this.#TORRENT.addStream(stream, peerId, metadata)
				}
				else if (engine.includes("mqtt")){
					this.#MQTT.addStream(stream, peerId, metadata)
				}
				else if (engine.includes("nostr")){
					this.#NOSTR.addStream(stream, peerId, metadata)
				}
			}
		}
	}

	#onStream = () => {}
	onStreaming = f => (this.#onStream = f)
	
	closeStreaming(stream,attribute){
		let peerId = attribute.connectId
		if(peerId == null){
			this.#connectpeers.forEach((peer,index)=>{
				let engine = peer.engine
				engine.forEach((protocol,idx)=>{
						if(protocol == "torrent")this.#TORRENT.removeStream(stream, peer.id)
						if(protocol == "mqtt")this.#MQTT.removeStream(stream, peer.id)
						if(protocol == "nostr")this.#NOSTR.removeStream(stream, peer.id)
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
				else if (engine.includes("nostr")){
					this.#NOSTR.addStream(stream, peerId)
				}
			}
		}
	}
	
	async Ping(attribute){
		let peerId = attribute.connectId
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
				else if (engine.includes("nostr")){
					return await this.#NOSTR.ping(peerId)
				}
			}
			
		}else{
			return []
		}
		
	}
	
	Disconnect(){
		if(Object.keys(this.#TORRENT.getPeers()).length !== 0)this.#TORRENT.leave()
		if(Object.keys(this.#MQTT.getPeers()).length !== 0)this.#MQTT.leave()
		if(Object.keys(this.#NOSTR.getPeers()).length !== 0)this.#NOSTR.leave()
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
						urls: 'stun:stun.l.google.com:19302',
					},
					{
						urls: 'stun:global.stun.twilio.com:3478',
					}
			  ]
			}
}){

	const config = {appId: appName,password:connectPassword,rtcConfig:iceConfiguration}
	
	const roomTORRENT = joinRoomTORRENT.joinRoom(config, channelName)
	
	const roomNOSTR = joinRoomNOSTR.joinRoom(config, channelName)
	
	const roomMQTT = joinRoomMQTT.joinRoom(config, channelName)

	const db = false

	const MyId = joinRoomTORRENT.selfId || joinRoomNOSTR.selfId || joinRoomMQTT.selfId
	
	const connect = {db:db,room:{
		roomTORRENT,
		roomNOSTR,
		roomMQTT
	},MyId}

	return new webConnect(connect)
}

export default webconnect