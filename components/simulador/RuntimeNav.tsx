"use client";

import Image from "next/image";
import { Button, Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import type { RuntimeSessionMode } from "@/lib/simulador/use-session";

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
          <Button
            as={Link}
            href="/auth/signup?next=%2Fonboarding%2Forg"
            radius="md"
            size="sm"
            className="accent-bg text-white ts-subhead font-medium h-9 px-4 shadow-none"
          >
            Crear cuenta
          </Button>
        ) : (
          <Button
            as={Link}
            href="/dashboard"
            radius="md"
            size="sm"
            variant="light"
            className="ts-subhead font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] h-9 px-3"
          >
            Dashboard
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
}
