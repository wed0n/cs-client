import { appWindow } from '@tauri-apps/api/window'
import { Chat } from 'component/Chat'
import { Player } from 'component/Player'
import RefreshButton from 'component/RefreshButton'
import { createContext, useEffect, useRef } from 'react'
import './index.scss'
import { appContext, message, serverMessage } from './interfaces'

export const AppContext = createContext<appContext>(null as any)

export default function App() {
  const websocketRef = useRef<WebSocket | null>(null)
  const handlers = useRef<Map<string, (data: any) => void>>(new Map())

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

  useEffect(() => {
    document
      .getElementById('minimize')
      ?.addEventListener('click', () => appWindow.minimize())
    document
      .getElementById('close')
      ?.addEventListener('click', () => appWindow.close())
    const websocket = new WebSocket('wss:///?steamid=')
    websocket.onmessage = (event) => {
      console.log(event.data)
      const result: serverMessage<any> = JSON.parse(event.data)
      const type = result.type
      const handler = handlers.current.get(type)
      if (handler != undefined) {
        handler(result.data)
      } else {
        console.error(`no handler for type ${type}`)
      }
    }
    websocket.onclose = () => {}
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
          <Player />
          <RefreshButton
            onClick={sendMessage.bind(null, 'REFRESH_USERS', '')}
          />
          <div className="bottom">
            <Chat />
            <div className="launchContainer">
              <button className="launch button">启动</button>
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  )
}
