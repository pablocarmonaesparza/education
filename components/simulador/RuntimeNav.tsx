"use client";

import Image from "next/image";
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { AppleButton } from "@/components/simulador/apple";

// "field_test" aquí es solo variante visual (logo → landing + CTA de signup);
// la consume el exercise-lab. No implica el modo de sesión field-test (borrado).
export function RuntimeNav({ mode }: { mode: "authenticated" | "field_test" }) {
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
            className="accent-bg text-white ts-subhead font-medium h-9 px-4 shadow-none"
          >
            Crear cuenta
          </AppleButton>
        ) : (
          <AppleButton
            as={Link}
            href="/dashboard"
            size="sm"
            tone="ghost"
            className="ts-subhead font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] h-9 px-3"
          >
            Dashboard
          </AppleButton>
        )}
      </NavbarContent>
    </Navbar>
  );
}
