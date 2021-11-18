import WebSocket from 'ws';
import { getJWTPayload } from '../conmon/Utils';
import Users from '../model/test';

class WebSocketSever {
  constructor(config = {}) {
    const defaultConfig = {
      port: 3001,
      timeInterval: 30 * 1000,
      isAuth: true
    }
    const finalConfig = { ...defaultConfig, ...config }
    this.wss = {}
    this.port = finalConfig.port
    this.timeInterval = finalConfig.timeInterval
    // this.interval = null
    this.isAuth = finalConfig.isAuth
    this.options = config.options || {}
  }
  init () {
    this.wss = new WebSocket.Server({
      port: this.port,
      ...this.options
    })


    // 连接信息
    this.wss.on('connection', (ws) => {
      ws.isAlive = true
      ws.send(JSON.stringify({
        event: 'heartbeat',
        message: 'ping'
      }))
      ws.on('message', (msg) => {
        this.onMessage(ws, msg)
      })

      ws.on('close', () => this.onClose(ws))
    })
    // 心跳检测
    this.heartbeat()
  }

  onMessage (ws, msg) {
    const msgObj = JSON.parse(msg)

    const events = {
      auth: async () => {
        try {
          const obj = await getJWTPayload(msgObj.message)
          if (obj) {
            const user = await Users.findById({ _id: obj._id })

            ws.isAuth = true
            ws._id = obj._id
            ws.send(JSON.stringify({
              events: 'noauth',
              message: {
                unread_num: user.unread_num,
                message: `您有${user.unread_num}条未读消息`
              }
            }))
          }
        } catch (err) {
          ws.send(JSON.stringify({
            events: 'noauth',
            message: 'please auth again'
          }))
        }
      },
      heartbeat: () => {
        // 鉴权拦截
        if (msgObj.message === 'pong') {
          ws.isAlive = true
        }
      },

      message: () => {
        // 鉴权拦截
        // if (!ws.isAuth && this.isAuth) {
        //   return
        // }
        // 消息广播
        // this.wss.clients.forEach(client => {
        //   if (client.readyState === WebSocket.OPEN && client._id === ws._id) {
        //     this.send(msg)
        //   }
        // });
      }
    }

    events[msgObj.event]()
  }
  // 点对点的消息发送
  send (uid, msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client._id === uid) {
        const jsonMsg = JSON.stringify({
          events: 'message',
          message: msg
        })

        client.send(jsonMsg)
      }
    })
  }
  // 广播消息 -> 推送系统消息
  broadcast (msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    })
  }

  onClose (ws) {

  }

  // 心跳检测
  heartbeat () {

    clearInterval(this.interval)
    this.interval = setInterval(() => {
      console.log('this.timeInterval: ', this.timeInterval);
      this.wss.clients.forEach(ws => {

        if (!ws.isAlive && ws.roomid) {
          delete ws.roomid

          return ws.terminate()
        }
        // 主动发送心跳检测请求
        // 当客户端返回消息之后,主动设置flag为在线
        ws.isAlive = false
        ws.send(JSON.stringify({
          event: 'heartbeat',
          message: 'ping'
        }))
      });

    }, this.timeInterval)
  }
}

export default WebSocketSever