import { invoke } from '@tauri-apps/api'
import { appWindow } from '@tauri-apps/api/window'
import { Chat } from 'component/Chat'
import { Player } from 'component/Player'
import RefreshButton from 'component/RefreshButton'
import { createContext, useEffect, useRef, useState } from 'react'
import './index.scss'
import { appContext, launchConfig, message, serverMessage } from './interfaces'

export const AppContext = createContext<appContext>(null as any)

const serverAddress = ''
const defaultCSAddress = ''

export default function App() {
  const isSteamReady = useRef(false)
  const launchConfig = useRef<launchConfig>({
    address: defaultCSAddress,
    csgo: false,
  })
  const websocketRef = useRef<WebSocket | null>(null)
  const handlers = useRef<Map<string, (data: any) => void>>(new Map())
  const [message, setMessage] = useState('')

  const sendMessage = <T,>(type: string, data: T): boolean => {
    const messageToServer: message<T> = {
      type: type,
      data: data,
    }
    const websocket = websocketRef.current
    if (websocket) {
      websocket.send(JSON.stringify(messageToServer))
      return true
    }
    return false
  }

  const launch = async () => {
    const config = launchConfig.current
    try {
      if (config.csgo) {
        await invoke('launch_csgo', { target: config.address })
      } else {
        await invoke('launch_cs2', { target: config.address })
      }
    } catch (e) {
      setMessage(e as string)
    }
  }

  useEffect(() => {
    document
      .getElementById('minimize')
      ?.addEventListener('click', () => appWindow.minimize())
    document
      .getElementById('close')
      ?.addEventListener('click', () => appWindow.close())

    handlers.current.set('LAUNCH_CONFIG', (data: launchConfig) => {
      launchConfig.current = data
    })
    handlers.current.set('LAUNCH', launch)

    const initConfig = async () => {
      let steamid = ''
      try {
        steamid = await invoke('get_steam_info')
      } catch (error) {
        setMessage(`${error},10秒后重试`)
        setTimeout(initConfig, 10000)
        return
      }

      const websocketConfig = async () => {
        const websocket = new WebSocket(
          `wss://${serverAddress}/?steamid=${steamid}`
        )
        websocket.onopen = (event) => {
          websocketRef.current = websocket
          setMessage('')
          console.log(event)
        }

        websocket.onclose = async (event) => {
          console.error(event)
          setMessage(`无法连接到服务器,10秒后重试`)
          await invoke('flush_dns')
          setTimeout(websocketConfig, 10000)
        }

        websocket.onmessage = (event) => {
          console.log(event.data)
          const result: serverMessage<any> = JSON.parse(event.data)
          const type = result.type
          const handler = handlers.current.get(type)
          if (handler != undefined) {
            handler(result.data)
          } else {
            setMessage(`no handler for type ${type}\n${event.data}`)
          }
        }
      }

      isSteamReady.current = true
      websocketConfig()
    }

    initConfig()
    return () => {
      websocketRef.current = null
    }
  }, [])

  return (
    <AppContext.Provider
      value={{
        sendMessage: sendMessage,
        handlers: handlers.current,
      }}>
      <div className="main">
        <div className="sidebar"></div>
        <div className="container">
          {message == '' ? (
            <Player />
          ) : (
            <div
              className="playersContainer"
              style={{
                color: '#f95d27',
                fontSize: 30,
              }}>
              {message}
            </div>
          )}
          <RefreshButton
            onClick={sendMessage.bind(null, 'REFRESH_USERS', '')}
          />
          <div className="bottom">
            <Chat />
            <div className="launchContainer">
              <button className="launch button" onClick={launch.bind(null)}>
                启动
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  )
}
