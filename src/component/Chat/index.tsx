import { AppContext } from 'App'
import RefreshButton from 'component/RefreshButton'
import { chatMessage } from 'interfaces'
import { useContext, useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import ChatMessage from './ChatMessage'
export function Chat() {
  const [chatMessages, setChatMessages] = useState<chatMessage[]>([])
  const [inputContent, setInputContent] = useState('')
  const { sendMessage, handlers } = useContext(AppContext)

  const sendChatMessage = () => {
    if (/^\s*$/.test(inputContent)) {
      return
    }
    if (sendMessage('NEW_CHAT', inputContent)) setInputContent('')
  }

  useEffect(() => {
    handlers.set('NEW_CHAT', (data: chatMessage) => {
      setChatMessages((prev) => [...prev, data].sort((a, b) => a.time - b.time))
    })
    handlers.set('REFRESH_CHATS', (data: chatMessage[]) => {
      setChatMessages(data)
    })
    return () => {
      setChatMessages([])
      setInputContent('')
    }
  }, [])

  return (
    <div className="chatContainer">
      <Virtuoso
        className="messageContainer"
        data={chatMessages}
        itemContent={(_index, data) => <ChatMessage {...data} />}
        followOutput={'auto'}
      />
      <RefreshButton onClick={sendMessage.bind(null, 'REFRESH_CHATS', '')} />
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
  )
}
