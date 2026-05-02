'use client'

// HOOKS
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState } from 'react'

// ICONES
import { LogOut, Send, User, MessageSquare, Loader2 } from "lucide-react";

// TOAST
import toast from "react-hot-toast";

// SOCKET
import { getSocket } from '../lib/socket'
import { BiChevronDown } from "react-icons/bi";
import { FaMailBulk, FaMailchimp, FaShieldAlt, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

type OnlineUser = {
  id: number
  name: string
}

export default function Home() {

  // NAVEGAÇÃO
  const router = useRouter();

  // INFOMAÇÕES DO USUÁRIO
  const { user, loading, isLogged } = useAuth();

  // MENSAGENS 
  const [messages, setMessages] = useState<any[]>([])

  // CAMPO DE TEXTO
  const [text, setText] = useState('');

  // SOCKET
  const socketRef = useRef<any>(null);

  // LISTA DE USUÁRIOS CONECTADOS
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  // URL DO BACKEND
  const URL = process.env.NEXT_PUBLIC_URL_BACK;

  const [openHeader, setOpenHeader] = useState(false)

  // SCROOL AUTOMATICO
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // USUARIOS
  const prevUsersRef = useRef<OnlineUser[]>([])

  // PARA BUSCAR MENSAGENS NO BANCO
  useEffect(() => {

    // SE NÃO TEM USUARIO RETORNA
    if (!user) return

    setMessages([]);

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    // SE NÃO TEM TOKEN RETORNA
    if (!token) return

    // MANDA O TOKEN
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

    // MANDA MENSAGEM
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

    // LISTA DE USUARIOS CONECTADOS
    socket.on('users_online', (users: OnlineUser[]) => {
      const prevUsers = prevUsersRef.current


      const entrou = users.filter(
        (u) => !prevUsers.some(prev => prev.id === u.id)
      )

      const saiu = prevUsers.filter(
        (u) => !users.some(curr => curr.id === u.id)
      )


      entrou.forEach((u) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `join-${u.id}-${Date.now()}`,
            system: true,
            text: `${u.name} entrou no chat`,
            createdAt: new Date().toISOString(),
          }
        ])
      })

      saiu.forEach((u) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `leave-${u.id}-${Date.now()}`,
            system: true,
            text: `${u.name} saiu do chat`,
            createdAt: new Date().toISOString(),
          }
        ])
      })

      prevUsersRef.current = users
      setOnlineUsers(users)
    })

    // BUSCAR MENSAGENS NO BANCO
    fetch(`${URL}/mensagem`)
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

  // MANDAR MENSAGEM
  const sendMessage = () => {
    if (!text.trim()) return

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

  // DESLOGAR
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

  // FEEDBACK
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium animate-pulse">Carregando sua experiência...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR / PROFILE INFO */}
        <aside className="lg:col-span-4 hidden md:flex flex-col gap-6 overflow-hidden ">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl">
            <button
              onClick={logout}
              className=" cursor-pointer flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 px-5 rounded-2xl font-semibold transition-all duration-300 border border-red-500/20 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <User className="w-10 h-10 text-white" />
              </div>

              {isLogged && user && (
                <>

                  <div>
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-slate-400 text-sm">Bem-vindo de volta!</p>
                  </div>

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

                </>
              )}
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
        <section className="absolute bottom-0 w-full md:relative lg:col-span-8 flex flex-col h-screen lg:h-[85vh] bg-slate-800/50 backdrop-blur-xl border border-slate-700 md:rounded-3xl shadow-2xl overflow-hidden">

          {/* CHAT HEADER */}
          <header className="px-6 py-4 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Chat em Tempo Real
              </h1>
              <p className="text-slate-400 text-xs">Sinta-se à vontade para escrever</p>
            </div>

            <div className="flex flex-col gap-2">

              <button
                onClick={logout}
                className=" cursor-pointer flex md:hidden items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 px-1 rounded-xl font-semibold transition-all duration-300 border border-red-500/20 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              {/* ONLINE USERS */}
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-slate-300 font-medium">
                  {onlineUsers.length} <span className="hidden md-flex">online</span>
                </span>
              </div>

            </div>
          </header>


          <header className="md:hidden relative bg-slate-800/50 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl overflow-visible">

            {/* BOTÃO NA BORDA */}
            <button
              onClick={() => setOpenHeader(!openHeader)}
              className="
      absolute left-1/2 -bottom-3 -translate-x-1/2
      w-7 h-7 flex items-center justify-center
      rounded-full bg-indigo-600/20 hover:bg-indigo-600/30
      border border-indigo-500/30
      transition-all duration-300
      hover:shadow-lg hover:shadow-indigo-500/20
      active:scale-95 z-20
    "
            >
              <BiChevronDown  
                className={`w-5 h-5 text-indigo-400 transition-transform duration-500 ${openHeader ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Conteúdo expansível com animação suave */}
            <div
              className={`
              transition-all duration-500 ease-in-out overflow-hidden border-b border-slate-800
              ${openHeader ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
            >
              <div className="px-4 pb-4 space-y-3 text-sm border-t border-slate-800/50 pt-4">

                {/* Informações do usuário */}
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30 space-y-3">

                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                      <span className="text-base"><FaUser /></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Nome</p>
                      <p className="text-slate-200 truncate font-medium">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <span className="text-base"><MdEmail />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Email</p>
                      <p className="text-slate-200 truncate text-xs font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <span className="text-base"><FaShieldAlt />
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cargo</p>
                      <span>
                        {user?.role}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </header>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

            {messages.map((msg, i) => {
              console.log('USER LOGADO:', user?.email)
              console.log('MSG:', msg.usuario?.email)

              if (msg.system) {
                return (
                  <div
                    key={msg.id}
                    className="text-center text-xs text-slate-500 italic bg-slate-800/40 px-3 py-1 rounded-lg self-center"
                  >
                    {msg.text}
                  </div>
                )
              }

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
                      className={`w-2 h-2 rounded-full ${onlineUsers.includes(msg.usuario?.id)
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                        }`}
                    />

                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {msg.usuario?.name || 'Usuário'}
                    </span>

                  </div>

                  <span className={`w-full relative top-2 text-center text-[8px] rounded-full rounded-b-none p-1 mb-2 bg-indigo-500/10 text-indigo-400 border
                  ${msg.usuario?.email === user?.email
                      ? 'rounded-tr-none border-indigo-500/20'
                      : 'rounded-tl border-slate-600 text-slate-400'
                    }`}>
                    <span className="relative top-px">

                      {msg.usuario?.role}

                    </span>
                  </span>

                  <div
                    className={`p-4 rounded-2xl border-t-0 ${msg.usuario?.email === user?.email
                      ? 'bg-indigo-600 text-white rounded-t-none'
                      : 'bg-slate-700/50 text-slate-100 rounded-t-none border border-slate-600'
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

                    </div>
                  </div>
                </div >
              )
            })}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT AREA */}
          <footer className="p-6 bg-slate-800/30 border-t border-slate-700">
            <div className="relative flex items-center gap-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                rows={1}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-slate-900/80 border border-slate-700 text-slate-200 p-4 pr-14 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
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
