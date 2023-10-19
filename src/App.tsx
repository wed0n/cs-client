import { useTransition } from '@react-spring/web'
import { appWindow } from '@tauri-apps/api/window'
import ChatMessage from 'component/ChatMessage'
import PlayerItem from 'component/Player'
import { useEffect, useState } from 'react'
import './index.scss'
import { chatMessage, player } from './interfaces'

export default function App() {
  const [players, setPlayers] = useState<player[]>([])
  const [chatMessages, setChatMessages] = useState<chatMessage[]>([])
  const transitions = useTransition(players, {
    from: { opacity: 0, transform: 'translateX(+60%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(-60%)' },
    config: { duration: 750 },
    unique: true,
    keys: (item) => item.personaname,
  })
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
      setPlayers(result.data)
    }
    websocket.onclose = () => {
      setPlayers([])
    }
    return () => {
      setPlayers([])
    }
  }, [])

  return (
    <div className="main">
      <div className="sidebar"></div>
      <div className="container">
        <div className="playersContainer">
          {transitions((style, item) => (
            <PlayerItem key={item.personaname} {...item} springProps={style} />
          ))}
        </div>
        <div className="bottom">
          <div className="chatContainer">
            <div className="messageContainer">
              {chatMessages.map((item) => (
                <ChatMessage key={item.time} {...item} />
              ))}
            </div>
            <div className="sendContainer">
              <input className="input" />
              <button className="send button">发送</button>
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
