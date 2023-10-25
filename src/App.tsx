import { useTransition } from '@react-spring/web'
import { appWindow } from '@tauri-apps/api/window'
import ChatMessage from 'component/ChatMessage'
import PlayerItem from 'component/Player'
import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import './index.scss'
import { chatMessage, message, player } from './interfaces'

export default function App() {
  const [players, setPlayers] = useState<player[]>([])
  const [chatMessages, setChatMessages] = useState<chatMessage[]>([])
  const [inputContent, setInputContent] = useState('')

  const websocketRef = useRef<WebSocket | null>(null)
  const transitions = useTransition(players, {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 86 },
    leave: { opacity: 0, width: 0 },
    config: { duration: 750 },
    unique: true,
    keys: (item) => item.steamid,
  })

  const sendChatMessage = () => {
    const chatMessage: message<string> = {
      type: 'NEW_CHAT',
      data: inputContent,
    }
    const websocket = websocketRef.current
    if (websocket) {
      websocket.send(JSON.stringify(chatMessage))
      setInputContent('')
    }
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
      const result = JSON.parse(event.data)
      const type = result.type
      switch (type) {
        case 'REFRESH_USERS':
          setPlayers(result.data)
          break
        case 'NEW_CHAT':
          setChatMessages((prev) =>
            [...prev, result.data].sort((a, b) => a.time - b.time)
          )
          break
      }
    }
    websocket.onclose = () => {
      setPlayers([])
    }
    return () => {
      setPlayers([])
      setChatMessages([])
    }
  }, [])

  return (
    <div className="main">
      <div className="sidebar"></div>
      <div className="container">
        <div className="playersContainer">
          {transitions((style, item) => (
            <PlayerItem {...item} springProps={style} />
          ))}
        </div>
        <div className="bottom">
          <div className="chatContainer">
            <Virtuoso
              className="messageContainer"
              data={chatMessages}
              itemContent={(_index, data) => <ChatMessage {...data} />}
              followOutput={'auto'}
            />
            <div className="sendContainer">
              <input
                className="input"
                value={inputContent}
                onChange={(event) => {
                  setInputContent(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    sendChatMessage()
                  }
                }}
              />
              <button
                className="send button"
                onClick={() => {
                  sendChatMessage()
                }}>
                发送
              </button>
            </div>
          </div>
          <div className="launchContainer">
            <button className="launch button">启动</button>
          </div>
        </div>
      </div>
    </div>
  )
}
