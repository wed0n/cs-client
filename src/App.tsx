import { appWindow } from '@tauri-apps/api/window'
import ChatMessage from 'component/ChatMessage'
import PlayerItem from 'component/Player'
import { useEffect, useState } from 'react'
import './index.scss'
import { chatMessage, player } from './interfaces'

export default function App() {
  const [players, setPlayers] = useState<player[]>([])
  const [chatMessages, setChatMessages] = useState<chatMessage[]>([])
  useEffect(() => {
    document
      .getElementById('minimize')
      ?.addEventListener('click', () => appWindow.minimize())
    document
      .getElementById('close')
      ?.addEventListener('click', () => appWindow.close())
  })
  return (
    <div className="main">
      <div className="sidebar"></div>
      <div className="container">
        <div className="playersContainer">
          {players.map((item) => (
            <PlayerItem key={item.personaname} {...item} />
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
