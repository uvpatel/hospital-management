"use client"

import * as React from "react"
import { NavMain, NavGroup } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  UsersIcon,
  UserCheckIcon,
  Building2Icon,
  CalendarDaysIcon,
  BedDoubleIcon,
  HotelIcon,
  PillIcon,
  BoxesIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  BarChart3Icon,
  ShieldAlertIcon,
  UserCogIcon,
  CommandIcon,
} from "lucide-react"
import Link from "next/link"

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon className="size-4" />,
      },
    ],
  },
  {
    label: "Clinical & OPD",
    items: [
      {
        title: "Patients",
        url: "/patients",
        icon: <UsersIcon className="size-4" />,
      },
      {
        title: "Doctors",
        url: "/doctors",
        icon: <UserCheckIcon className="size-4" />,
      },
      {
        title: "Departments",
        url: "/department",
        icon: <Building2Icon className="size-4" />,
      },
      {
        title: "Appointments",
        url: "/clinical/appointments",
        icon: <CalendarDaysIcon className="size-4" />,
      },
    ],
  },
  {
    label: "Inpatient (IPD)",
    items: [
      {
        title: "Admissions",
        url: "/inpatient/admissions",
        icon: <HotelIcon className="size-4" />,
      },
      {
        title: "Rooms & Rates",
        url: "/room",
        icon: <Building2Icon className="size-4" />,
      },
      {
        title: "Beds Management",
        url: "/beds",
        icon: <BedDoubleIcon className="size-4" />,
      },
    ],
  },
  {
    label: "Pharmacy & Stock",
    items: [
      {
        title: "Pharmacy Catalog",
        url: "/pharmacy",
        icon: <PillIcon className="size-4" />,
      },
      {
        title: "Medicines List",
        url: "/pharmacy/medicines",
        icon: <PillIcon className="size-4" />,
      },
      {
        title: "Inventory Batches",
        url: "/pharmacy/inventory",
        icon: <BoxesIcon className="size-4" />,
      },
      {
        title: "Point of Sale",
        url: "/pharmacy/sales",
        icon: <ShoppingCartIcon className="size-4" />,
      },
    ],
  },
  {
    label: "Finance & Accounting",
    items: [
      {
        title: "Invoices & Payments",
        url: "/billing/invoices",
        icon: <ReceiptIcon className="size-4" />,
      },
      {
        title: "Operational Reports",
        url: "/reports",
        icon: <BarChart3Icon className="size-4" />,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Staff Users",
        url: "/admin/users",
        icon: <UserCogIcon className="size-4" />,
      },
      {
        title: "Audit Log Trail",
        url: "/admin/audit-logs",
        icon: <ShieldAlertIcon className="size-4" />,
      },
    ],
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar?: string }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Niramay Hospital</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
