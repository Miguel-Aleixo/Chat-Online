'use client'

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { LogOut, Send, User, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getSocket } from '../lib/socket'
import { useEffect, useRef, useState } from 'react'


export default function Home() {
  const router = useRouter();
  const { user, loading, isLogged } = useAuth();
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('');
  const socketRef = useRef<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([])

  useEffect(() => {
    if (!user) return

    setMessages([]);

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) return

    const socket = getSocket(token)

    socketRef.current = socket

    socket.connect()

    socket.on('connect', () => {
      console.log('🟢 socket conectado')
    })

    socket.on('disconnect', () => {
      console.log('🔴 socket desconectou')
    })

    socket.off('new_message')

    socket.on('new_message', (msg) => {
      setMessages((prev) => {
        const exists = prev.some(m => m.id === msg.id)

        if (exists) return prev

        return [...prev, msg]
      })

      if (msg.usuario?.id !== user?.id && !msg.readAt) {
        socket.emit('message_read', msg.id)
      }
    })

    socket.on('message_updated', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === updatedMsg.id ? updatedMsg : m
        )
      )
    })

    socket.on('users_online', (users) => {
      setOnlineUsers(users)
    })

    fetch('http://localhost:5000/mensagem')
      .then(res => res.json())
      .then(data => {
        console.log('RETORNO BACK:', data)  

        data.forEach((msg: any) => {
          if (msg.usuario?.id !== user?.id && !msg.readAt) {
            socket.emit('message_read', msg.id)
          }
        })

        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          console.log('⚠️ NÃO É ARRAY')
          setMessages([])
        }
      })
      .catch(err => {
        console.log('ERRO FETCH:', err)
        setMessages([])
      })


    return () => {
      socket.off('new_message')
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const sendMessage = () => {
    const socket = socketRef.current

    if (!socket || !socket.connected) {
      console.log('⛔ socket não conectado')
      return
    }

    socket.emit('send_message', {
      text,
    })

    setText('')
  }

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error)
        return
      }

      router.push('/auth/login');
    } catch (err: any) {
      console.log(err)
      toast.error(err.message || 'Erro inesperado')
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium animate-pulse">Carregando sua experiência...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR / PROFILE INFO */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <User className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
                <p className="text-slate-400 text-sm">Bem-vindo de volta!</p>
              </div>

              {isLogged && user && (
                <div className="w-full text-left mt-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex flex-col gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Email</span>
                    <span className="text-sm text-slate-200 truncate w-full">{user.email}</span>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cargo</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                className="w-full mt-4 cursor-pointer flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 px-5 rounded-2xl font-semibold transition-all duration-300 border border-red-500/20 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Sair da conta
              </button>
            </div>
          </div>

          <div className="hidden lg:block bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl">
            <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Dica do Chat
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use emojis para tornar a conversa mais divertida e interativa com seus amigos!
            </p>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <section className="lg:col-span-8 flex flex-col h-[70vh] lg:h-[92vh] bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">

          {/* CHAT HEADER */}
          <header className="p-6 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Chat em Tempo Real
              </h1>
              <p className="text-slate-400 text-xs">Sinta-se à vontade para escrever</p>
            </div>
          </header>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

            {messages.map((msg, i) => {
              console.log('USER LOGADO:', user?.email)
              console.log('MSG:', msg.usuario?.email)
              return (

                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${msg.usuario?.email === user?.email
                    ? 'ml-auto items-end'
                    : 'mr-auto items-start'
                    }`}
                >

                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${onlineUsers.includes(msg.usuario?.email)
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                        }`}
                    />

                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {msg.usuario?.name || 'Usuário'}
                    </span>

                    <span className="text-[9px] px-1 py-[1px] rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {msg.usuario?.role}
                    </span>

                  </div>

                  <div
                    className={`p-4 rounded-2xl ${msg.usuario?.email === user?.email
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-700/50 text-slate-100 rounded-tl-none border border-slate-600'
                      }`}
                  >
                    <span className="block">
                      {msg.text}
                    </span>

                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-70">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {msg.usuario?.email === user?.email && (
                        <span className={msg.readAt ? 'text-blue-400' : ''}>
                          {msg.readAt ? '✔✔' : '✔'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

          </div>

          {/* INPUT AREA */}
          <footer className="p-6 bg-slate-800/30 border-t border-slate-700">
            <div className="relative flex items-center gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-slate-900/80 border border-slate-700 text-slate-200 p-4 pr-14 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
              <button
                onClick={sendMessage}
                className="absolute cursor-pointer right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group">
                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </footer>

        </section>
      </div>
    </main>
  );
}
