import { AuthForm } from '@/components/auth-form'

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const returnTo = resolvedSearchParams?.returnTo

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <AuthForm mode="login" returnTo={returnTo} />
    </main>
  )
}
