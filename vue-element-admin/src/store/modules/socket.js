export default {
	namespaced: true,
	state: {
		socket: null,
		url: '',
		lockReconnect: false, //是否真正建立连接
		timeout: 60 * 1000, //60秒一次心跳
		timeoutObj: null, //心跳心跳倒计时
		serverTimeoutObj: null, //心跳倒计时
		timeoutnum: null, //断开 重连倒计时
		notification: [],
	},
	getters: {
		notification(state) {
			return state.notification;
		}
	},
	mutations: {
		SOCKET_INIT(state, url, uid) {
			var that = this;
			state.socket = new WebSocket(url);
			state.url = url;
			state.socket.onopen = function () {
				console.log("连接成功") //发送用户JWT令牌 后端解析后自动绑定用户
				state.socket.send({ uid: uid })
				// state.socket.send('OpenBarScanner')
				//发送心跳包
				that.commit('socket/start')
			}
			state.socket.onmessage = function (callBack) {
				// console.log(callBack.data)
				//重置心跳
				// console.log(callBack.data)
				that.commit('socket/reset')
				if (callBack.data == 'heartCheck') {
					return;
				}
				state.notification = callBack.data
			}
			state.socket.οnerrοr = function (err) { //e错误
				console.log(err)
				that.commit('socket/reconnect')
			}
			state.socket.onclose = function (err) { //e关闭
				console.log(err)
				that.commit('socket/reconnect')
			}
		},
		SOCKET_SEND(state, notification) {
			state.socket.send(notification);
		},
		reconnect(state) { //重新连接
			console.log("重新连接")
			var that = this;
			if (state.lockReconnect) {
				return;
			}
			state.lockReconnect = true;
			//没连接上会一直重连，设置延迟避免请求过多
			state.timeoutnum && clearTimeout(state.timeoutnum);
			state.timeoutnum = setTimeout(function () {
				//新连接
				that.commit('socket/SOCKET_INIT', state.url)
				state.lockReconnect = false;
			}, 5000);
		},
		reset(state) { //重置心跳
			//清除时间
			clearTimeout(state.timeoutObj);
			clearTimeout(state.serverTimeoutObj);
			//心跳
			this.commit('socket/start')
		},
		start(state) { //开启心跳
			// console.log("开启心跳")
			var that = this;
			state.timeoutObj && clearTimeout(state.timeoutObj);
			state.serverTimeoutObj && clearTimeout(state.serverTimeoutObj);
			state.timeoutObj = setTimeout(function () {
				//这里发送一个心跳，后端收到后，返回一个心跳消息，
				// console.log(state.socket)
				if (state.socket.readyState == 1) { //如果连接正常
					state.socket.send("heartCheck");
				} else { //否则重连
					that.commit('socket/reconnect')
				}
				state.serverTimeoutObj = setTimeout(function () {
					//超时关闭
					state.socket.close();
				}, state.timeout);

			}, state.timeout)
		},
	},
	actions: {
		SOCKET_INIT({ commit }, url) {
			commit('SOCKET_INIT', url)
		},
		SOCKET_SEND({ commit }, notification) {
			commit('SOCKET_SEND', notification)
		},

	}
}
