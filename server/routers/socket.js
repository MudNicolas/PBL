import express from 'express';
import expressWs from 'express-ws';


const router = express();
expressWs(router)

router.ws('/', (ws, req) => {
	//console.log(ws)
	ws.on('message', (msg) => {

		//心跳检测 60s一次
		if (msg === 'heartCheck') {
			ws.send('heartCheck')
		}
		console.log(msg)
	})
})

export default router
