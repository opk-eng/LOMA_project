'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, pending] = useActionState(loginAction, { success: false, error: undefined })

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block" aria-label="LOMA — Página inicial">
            <span className="font-heading text-4xl font-medium tracking-tight text-charcoal-900">LOMA</span>
          </Link>
          <p className="text-sm text-charcoal-500 mt-2">Cozinha e Padaria Artesanal</p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <h1 className="font-heading text-2xl font-medium text-center mb-2">Entrar no painel</h1>
          <p className="text-charcoal-600 text-center text-sm mb-8">Acesso restrito a administradores</p>

          {state.error && (
            <div
              className="mb-6 p-4 bg-terracotta-50 border border-terracotta-200 rounded-lg text-terracotta-800 text-sm"
              role="alert"
            >
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-5" noValidate>
            <Input
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="admin@loma.local"
              disabled={pending}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                disabled={pending}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-charcoal-400 hover:text-charcoal-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={pending}
            >
              {pending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-charcoal-500 text-center">
              <strong>Desenvolvimento:</strong> admin@loma.local / admin123
              <br />
              Altere a senha no primeiro acesso.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-charcoal-500 mt-6">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}