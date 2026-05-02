import { io, Socket } from 'socket.io-client'

export function getSocket(token: string): Socket {
    const URL = process.env.NEXT_PUBLIC_URL_BACK

    return io(URL, {
        autoConnect: false,
        auth: { token },
    })
}