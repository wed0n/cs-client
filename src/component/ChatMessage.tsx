import { chatMessage } from 'interfaces'

export default function ChatMessage(props: chatMessage) {
  const date = new Date(props.time)
  const timeResult = date.toLocaleTimeString()

  return (
    <div className="message">
      <span className="time">{timeResult}</span>{' '}
      <span className="name">{props.name}</span> : {props.content}
    </div>
  )
}
