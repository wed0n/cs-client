export interface player {
  steamid: number
  personaname: string
  avatarhash: string
  springProps: any
}

export interface chatMessage {
  time: number
  name: string
  content: string
}

export interface message<T> {
  type: string
  data: T
}
