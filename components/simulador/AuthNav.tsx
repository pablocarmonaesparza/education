"use client";

import Image from "next/image";
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { AppleButton } from "@/components/simulador/apple";

export function AuthNav({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next: string;
}) {
  const isLogin = mode === "login";
  const target = isLogin ? "/auth/signup" : "/auth/login";
  const defaultNext = isLogin ? "/dashboard" : "/onboarding/org";
  const href =
    next && next !== defaultNext
      ? `${target}?next=${encodeURIComponent(next)}`
      : target;

  return (
    <Navbar
      maxWidth="full"
      isBordered={false}
      className="surface-backdrop"
      classNames={{
        wrapper: "px-6 max-w-7xl mx-auto h-14",
      }}
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" color="foreground" className="flex items-center">
            <Image
              src="/images/itera-logo-light.png"
              alt="Itera"
              width={64}
              height={32}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <AppleButton
          as={Link}
          href={href}
          size="sm"
          tone="ghost"
          className="text-[13.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] h-9 px-3"
        >
          {isLogin ? "Crear cuenta" : "Iniciar sesión"}
        </AppleButton>
      </NavbarContent>
    </Navbar>
  );
}
