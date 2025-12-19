'use client'

import { useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')

  return <LoginForm redirectTo={redirectedFrom || '/admin'} />
}