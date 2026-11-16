"use client";

import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { adminNavItems, laksmaNavItems, pppkNavItems } from "./data";
import AppSidebarHeader from "./sidebar-header";
import SidebarNavGroup from "./sidebar-nav-group";
import { MenuType, NavItem } from "./types";
import { supabase } from "@/lib/supabase/client";

export default function AppSidebar() {
  const { open, isMobile, isHovered } = useSidebar();
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<"admin" | "pppk" | "laksma" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (prof?.role) {
          setCurrentRole(prof.role as any);
        }
      }
    });
  }, []);

  const showContent = open || isHovered || isMobile;

  // Tentukan items menu berdasarkan role user yang sedang login atau prefix path
  let activeNavItems: NavItem[] = adminNavItems;
  if (currentRole === "pppk" || pathname.startsWith("/pppk")) {
    activeNavItems = pppkNavItems;
  }

  const menuSections: { type: MenuType; labelKey: string; items: NavItem[] }[] = [
    { type: "main", labelKey: "groups.menu", items: activeNavItems },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(null);

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <Sidebar side="left" collapsible="icon">
      <AppSidebarHeader showContent={showContent} />

      <SidebarContent className="overflow-y-auto px-5 duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuSections.map((section) => (
              <SidebarNavGroup
                key={section.type}
                labelKey={section.labelKey}
                menuType={section.type}
                items={section.items}
                openSubmenu={openSubmenu}
                showContent={showContent}
                pathname={pathname}
                onToggleSubmenu={handleSubmenuToggle}
              />
            ))}
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

