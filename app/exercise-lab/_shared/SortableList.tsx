"use client";

/**
 * SortableList — promovido al design system como `AppleSortableList`.
 * Este archivo queda como re-export para no romper los imports existentes
 * (`import { SortableList } from "../_shared/SortableList"`). La fuente única
 * vive en `components/simulador/apple/AppleSortableList.tsx`.
 */
export { AppleSortableList as SortableList } from "@/components/simulador/apple";
export type { AppleSortableListProps as SortableListProps } from "@/components/simulador/apple";
