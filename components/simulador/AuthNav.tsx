"use client";

import Image from "next/image";
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";

/**
 * Nav de las pantallas de auth: solo el logo (vuelve al landing).
 * El CTA a la pantalla hermana (crear cuenta / iniciar sesión) vive dentro
 * del propio formulario, así que el nav se mantiene limpio.
 */
export function AuthNav() {
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
    </Navbar>
  );
}
