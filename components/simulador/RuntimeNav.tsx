"use client";

import Image from "next/image";
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import type { RuntimeSessionMode } from "@/lib/simulador/use-session";
import { AppleButton } from "@/components/simulador/apple";

export function RuntimeNav({ mode }: { mode: RuntimeSessionMode }) {
  const isFieldTest = mode === "field_test";

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
          <Link
            href={isFieldTest ? "/" : "/dashboard"}
            color="foreground"
            className="flex items-center gap-2.5"
          >
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
        {isFieldTest ? (
          <AppleButton
            as={Link}
            href="/auth/signup?next=%2Fonboarding%2Forg"
            size="sm"
            tone="primary"
            className="accent-bg text-white text-[13.5px] font-medium h-9 px-4 shadow-none"
          >
            Crear cuenta
          </AppleButton>
        ) : (
          <AppleButton
            as={Link}
            href="/dashboard"
            size="sm"
            tone="ghost"
            className="text-[13.5px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] h-9 px-3"
          >
            Dashboard
          </AppleButton>
        )}
      </NavbarContent>
    </Navbar>
  );
}
