import { animated } from '@react-spring/web'
import { player } from 'interfaces'

export default function PlayerItem(props: player) {
  return (
    <animated.div style={props.springProps} className="playerItemContainer">
      <div className="playerItem">
        <img
          className="avatar"
          src={`https://avatars.steamstatic.com/${props.avatarhash}_full.jpg`}
        />
        <div className="name">{props.personaname}</div>
      </div>
    </animated.div>
  )
}
