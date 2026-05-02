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

const onlineUsers = new Map<number, Set<string>>()

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
          onlineUsers.set(userId, new Set())
        }

        onlineUsers.get(userId)?.add(client.id)
      }

      // 🔥 AVISA TODO MUNDO QUEM TÁ ONLINE
      this.server.emit('users_online', Array.from(onlineUsers.keys()))

    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    console.log('🔴 CLIENT DESCONECTOU')

    const userId = client.data.user?.sub

    if (userId && onlineUsers.has(userId)) {
      const sockets = onlineUsers.get(userId)

      sockets?.delete(client.id)

      if (sockets?.size === 0) {
        onlineUsers.delete(userId)
      }
    }

    // 🔥 ATUALIZA LISTA PRA TODO MUNDO
    this.server.emit('users_online', Array.from(onlineUsers.keys()))
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() dto: CreateMensagemDto, @ConnectedSocket() client: Socket) {
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

    return message
  }

  @SubscribeMessage('message_read')
  async markAsRead(@MessageBody() msgId: number) {
    const message = await this.mensagemService.markAsRead(msgId)

    this.server.emit('message_updated', message)

    return message
  }
}