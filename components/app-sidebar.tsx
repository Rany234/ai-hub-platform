"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Globe,
  MessageCircle,
  LayoutDashboard,
  Briefcase,
  User,
  ArrowLeftCircle,
  Package,
  Store,
  ShoppingBag,
  Wallet,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 hover:opacity-80 transition-opacity">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">AI Hub</span>
            <span className="truncate text-xs text-muted-foreground">控制台</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 概览 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    <span>概览</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 我的工作台 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/workbench"}>
                  <Link href="/dashboard/workbench">
                    <Briefcase className="size-4" />
                    <span>我的工作台</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 服务市场 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/listings"}>
                  <Link href="/listings">
                    <Store className="size-4" />
                    <span>服务市场</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 悬赏大厅 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/jobs"}>
                  <Link href="/dashboard/jobs">
                    <Globe className="size-4" />
                    <span>悬赏大厅</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 我的订单 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/orders"}>
                  <Link href="/dashboard/orders">
                    <ShoppingBag className="size-4" />
                    <span>我的订单</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 资金管理 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/wallet"}>
                  <Link href="/dashboard/wallet">
                    <Wallet className="size-4" />
                    <span>资金管理</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 个人主页 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile/me" || pathname.startsWith("/dashboard/profile/")}>
                  <Link href="/dashboard/profile/me">
                    <User className="size-4" />
                    <span>个人主页</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 我的服务 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/services"}>
                  <Link href="/dashboard/services">
                    <Package className="size-4" />
                    <span>我的服务</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 消息沟通 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/chat"}>
                  <Link href="/dashboard/chat">
                    <MessageCircle className="size-4" />
                    <span>消息沟通</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 设置 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" />
                    <span>设置</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 返回官网 */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" target="_self">
                    <ArrowLeftCircle className="size-4" />
                    <span>返回官网</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
