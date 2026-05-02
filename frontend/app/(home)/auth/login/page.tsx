'use client'

// HOOKS
import { useRouter } from "next/navigation"
import { useState } from "react"

// ICONES
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { FaChrome, FaGithub } from "react-icons/fa"

// TOAST
import toast from "react-hot-toast"

export default function Login() {

    // NAVEGAÇÃO
    const router = useRouter();

    // FORMULÁRIO
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    // FEEDBACK
    const [isLoading, setIsLoading] = useState(false);

    // FORMATAÇÃO DE ERRO -> APENAS PARA DEIXAR BONITO
    const formatError = (data: any) => {
        if (!data) return 'Erro inesperado'

        if (Array.isArray(data.message)) {
            return data.message.join(', ')
        }

        if (typeof data.message === 'string') {
            return data.message
        }

        if (typeof data.error === 'string') {
            return data.error
        }

        return 'Erro inesperado'
    }

    // AUTENTICAÇÃO
    const login = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(formatError(data))
                return
            }

            router.push('/');

        } catch (err: any) {
            console.log(err)
            toast.error(formatError(err))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black flex items-center justify-center px-4 py-6 relative overflow-hidden">

            {/* BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-100 relative">
                {/* CARD */}
                <div className="md:bg-slate-800/40 backdrop-blur-2xl md:border border-slate-700/50 p-6 md:p-8 md:rounded-4xl md:shadow-2xl">

                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-3 rotate-3">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo</h1>
                        <p className="text-slate-400 text-sm mt-1">Acesse sua conta</p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={login} className="flex flex-col gap-4">

                        {/* EMAIL */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* SENHA */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senha</label>
                                <a href="#" className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Esqueceu?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* BOTÃO */}
                        <button
                            disabled={isLoading}
                            className="cursor-pointer mt-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group active:scale-[0.98] text-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50"></div>
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase">
                            <span className=" px-3 text-slate-500 font-bold tracking-widest">Ou</span>
                        </div>
                    </div>

                    {/* SOCIAL LOGIN */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center cursor-pointer justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium text-xs">
                            <FaGithub className="w-4 h-4" />
                            Github
                        </button>
                        <button className="flex items-center cursor-pointer justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium text-xs">
                            <FaChrome className="w-4 h-4" />
                            Google
                        </button>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-xs font-medium">
                            Não tem conta?{' '}
                            <a href="/auth/cadastro" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-4 hover:underline">
                                Criar agora
                            </a>
                        </p>
                    </div>

                </div>

                {/* BOTTOM TEXT */}
                <p className="text-center text-slate-600 text-[9px] mt-6 uppercase tracking-[0.2em] font-bold">
                    Segurança de ponta a ponta
                </p>
            </div>

        </main>
    )
}
