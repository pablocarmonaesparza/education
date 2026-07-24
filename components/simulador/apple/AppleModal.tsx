"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  type ModalProps,
} from "@heroui/react";
import { cn } from "./utils";

export function AppleModal({ classNames, ...props }: ModalProps) {
  return (
    <Modal
      radius="lg"
      shadow="none"
      backdrop="blur"
      {...props}
      classNames={{
        backdrop: cn("bg-black/35", classNames?.backdrop),
        base: cn(
          "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-float",
          classNames?.base,
        ),
        header: cn("px-6 pt-6 pb-3", classNames?.header),
        body: cn("px-6 py-3", classNames?.body),
        footer: cn("px-6 pt-3 pb-6", classNames?.footer),
        closeButton: cn(
          "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
          classNames?.closeButton,
        ),
      }}
    />
  );
}

export { ModalContent as AppleModalContent };
export { ModalHeader as AppleModalHeader };
export { ModalBody as AppleModalBody };
export { ModalFooter as AppleModalFooter };
