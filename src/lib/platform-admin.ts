import 'server-only'

import { prisma } from './db'

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPlatformAdmin: true, email: true },
  })

  if (!user) {
    return false
  }

  if (user.isPlatformAdmin) {
    return true
  }

  const adminEmails = process.env.PLATFORM_ADMIN_EMAILS
    ?.split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean) ?? []

  if (adminEmails.length > 0 && adminEmails.includes(user.email.toLowerCase())) {
    return true
  }

  return false
}
