"use client";

/**
 * SlideBody — promovido al design system como `AppleSlideBody`.
 * Este archivo queda como re-export para no romper los imports existentes
 * (`import { SlideBody } from "../_shared/SlideBody"`). La fuente única vive en
 * `components/simulador/apple/AppleSlideBody.tsx`.
 */
export { AppleSlideBody as SlideBody } from "@/components/simulador/apple/AppleSlideBody";
export type { AppleSlideBodyProps as SlideBodyProps } from "@/components/simulador/apple/AppleSlideBody";
