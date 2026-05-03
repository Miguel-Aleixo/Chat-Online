import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MensagemService } from './mensagem.service'
import { CreateMensagemDto } from './dto/create-mensagem.dto'
import * as jwt from 'jsonwebtoken'

type OnlineUser = {
  name: string
  sockets: Set<string>
}

const onlineUsers = new Map<number, OnlineUser>()

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  }
})

export class MensagemGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly mensagemService: MensagemService) { }

  @WebSocketServer()
  server!: Server

  handleConnection(client: Socket) {
    console.log('🔌 CLIENT CONECTOU')

    const token = client.handshake.auth?.token

    if (!token) {
      client.disconnect()
      return
    }

    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET!)

      client.data.user = payload

      const userId = payload.sub

      if (userId) {
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, {
            name: payload.name,
            sockets: new Set()
          })
        }

        onlineUsers.get(userId)!.sockets.add(client.id)
      }

      this.server.emit(
        'users_online',
        Array.from(onlineUsers.entries()).map(([id, data]) => ({
          id,
          name: data.name
        }))
      )

    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub

    if (userId && onlineUsers.has(userId)) {
      const user = onlineUsers.get(userId)!

      user.sockets.delete(client.id)

      if (user.sockets.size === 0) {
        onlineUsers.delete(userId)
      }
    }

    this.server.emit(
      'users_online',
      Array.from(onlineUsers.entries()).map(([id, data]) => ({
        id,
        name: data.name
      }))
    )
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() dto: any, @ConnectedSocket() client: Socket) {
    console.log('DTO RECEBIDO:', dto)
    console.log('USER:', client.data.user)

    const userId = client.data.user?.sub

    if (!userId) {
      console.log('SEM USER ID')
      return
    }

    const message = await this.mensagemService.create(dto, userId)

    console.log('MENSAGEM CRIADA:', message)

    this.server.emit('new_message', message)

  }

  @SubscribeMessage('update_message')
  async editMessage(@MessageBody() data: { id: number, text: string }, @ConnectedSocket() client: Socket) {

    const userId = client.data.user?.sub

    if (!data.id || !data.text) {
      return
    }

    if (!userId) {
      return
    }

    const message = await this.mensagemService.update(data.id, data.text, userId)

    console.log('MENSAGEM ATUALIZADA:', message)

    this.server.emit('message_updated', message)

  }

  @SubscribeMessage('delete_message')
  async deleteMessage(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {

    const userId = client.data.user?.sub

    if (!data.id) {
      return
    }

    if (!userId) {
      return
    }

    const message = await this.mensagemService.remove(data.id)

    console.log('MENSAGEM DELETADA:', message)

    this.server.emit('message_deleted', message)

  }
}