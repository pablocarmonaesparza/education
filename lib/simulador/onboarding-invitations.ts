export interface OnboardingInviteDraft {
  email: string;
  isAdmin?: boolean;
}

export interface NormalizedOnboardingInvite {
  email: string;
  intended_role: "manager" | "employee";
}

export interface OnboardingInviteValidation {
  rows: Array<{
    email: string;
    isAdmin: boolean;
    isValid: boolean;
  }>;
  validRows: NormalizedOnboardingInvite[];
  invalidIndexes: number[];
  canSubmit: boolean;
  validCount: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidInviteEmail(email: string) {
  return EMAIL_RE.test(email.trim());
}

export function validateOnboardingInvites(
  drafts: OnboardingInviteDraft[],
): OnboardingInviteValidation {
  const rows = drafts.map((draft) => {
    const email = draft.email.trim().toLowerCase();
    return {
      email,
      isAdmin: draft.isAdmin ?? false,
      isValid: isValidInviteEmail(email),
    };
  });

  const invalidIndexes: number[] = [];
  const validRows: NormalizedOnboardingInvite[] = [];

  rows.forEach((row, index) => {
    if (!row.isValid) {
      invalidIndexes.push(index);
      return;
    }

    validRows.push({
      email: row.email,
      intended_role: row.isAdmin ? "manager" : "employee",
    });
  });

  const canSubmit = rows.length > 0 && invalidIndexes.length === 0;
  return {
    rows,
    validRows,
    invalidIndexes,
    canSubmit,
    validCount: validRows.length,
  };
}
