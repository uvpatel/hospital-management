"use client"

import { UserButton, useUser } from '@clerk/nextjs'
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user: _user,
}: {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}) {
  const { user, isLoaded } = useUser()

  if (!isLoaded || !user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-3 px-3 py-2">
        <UserButton showName />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
