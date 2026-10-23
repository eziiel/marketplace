export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ENS_LABEL = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
export const USERNAME = /^[a-zA-Z0-9._-]{3,30}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function firstInvalid<T extends string>(
  order: readonly T[],
  errors: Partial<Record<T, string>>,
): T | undefined {
  return order.find((key) => errors[key]);
}

export function focusField(formId: string, name: string): void {
  const form = document.getElementById(formId);

  if (!(form instanceof HTMLFormElement)) return;

  const control = form.elements.namedItem(name);

  if (control instanceof HTMLElement) {
    control.focus();
  }
}
