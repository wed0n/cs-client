import { useTransition } from '@react-spring/web'
import { AppContext } from 'App'
import { player } from 'interfaces'
import { useContext, useEffect, useState } from 'react'
import PlayerItem from './PlayerItem'
export function Player() {
  const [players, setPlayers] = useState<player[]>([])
  const { handlers } = useContext(AppContext)
  const transitions = useTransition(players, {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 86 },
    leave: { opacity: 0, width: 0 },
    config: { duration: 750 },
    unique: true,
    keys: (item) => item.steamid,
  })
  useEffect(() => {
    handlers.set('REFRESH_USERS', (data: player[]) => {
      setPlayers(data)
    })
  }, [])
  return (
    <div className="playersContainer">
      {transitions((style, item) => (
        <PlayerItem {...item} springProps={style} />
      ))}
    </div>
  )
}
