'use client'

// HOOKS
import { useRouter } from "next/navigation";
import { useState } from "react"

// ICONES
import { User, Mail, Lock, UserPlus, Loader2, ArrowRight } from "lucide-react"

// TOAST
import toast from 'react-hot-toast'

export default function Cadastro() {

    // URL DO BACKEND
    const URL = process.env.NEXT_PUBLIC_URL_BACK;

    // NAVEGAÇÃO
    const router = useRouter();

    // FORMULÁRIO
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })

    // FEEDBACK
    const [isLoading, setIsLoading] = useState(false)

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

    // CADASTRO
    const cadastrar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const res = await fetch(`${URL}/usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json();

            if (!res.ok) {
                toast.error(formatError(data))
                return
            }

            // LOGIN DIRETO
            const logar = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            })

            const dataLogar = await logar.json()

            if (!res.ok) {
                toast.error(formatError(dataLogar))
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
        <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black flex items-center justify-between relative overflow-hidden">

                <div className="md:w-[50vw] flex flex-col justify-center w-full relative h-screen md:bg-slate-800/40 backdrop-blur-2xl p-6 md:p-8  md:shadow-2xl">

                    {/* CARD */}
                    <div className="px-20">

                        {/* HEADER */}
                        <div className="text-center md:text-left mb-6">
                            <div className="md:hidden inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20 mb-3 -rotate-3">
                                <UserPlus className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta</h1>
                            <p className="text-slate-400 text-sm mt-1">Junte-se a nós hoje</p>
                        </div>

                        {/* FORM */}
                        <form onSubmit={cadastrar} className="flex flex-col gap-3.5 w-full">

                            {/* NOME */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Seu nome"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="seu@email.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* SENHA */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Senha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* BOTÃO */}
                            <button
                                disabled={isLoading}
                                className="cursor-pointer mt-3 w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group active:scale-[0.98] text-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Criar conta
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                        </form>

                        {/* FOOTER */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-xs font-medium">
                                Já tem conta?{' '}
                                <a href="/auth/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline-offset-4 hover:underline">
                                    Fazer login
                                </a>
                            </p>
                        </div>

                    </div>

                    {/* TERMS - Mais discreto */}
                    <p className="text-center text-slate-600 text-[9px] mt-6 leading-relaxed">
                        Ao se cadastrar, você concorda com nossos <br />
                        <span className="font-bold uppercase tracking-wider">Termos</span> e <span className="font-bold uppercase tracking-wider">Privacidade</span>
                    </p>
                </div>

            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

        </main>
    )
}
