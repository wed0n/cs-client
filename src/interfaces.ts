export interface appContext {
  sendMessage: <T>(type: string, data: T) => boolean
  handlers: Map<string, (data: any) => void>
}

export interface serverMessage<T>{
  type:string
  data:T
  code:number
}

export interface message<T> {
  type: string
  data: T
}

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

export interface launchConfig {
  address:string,
  csgo:boolean
}
