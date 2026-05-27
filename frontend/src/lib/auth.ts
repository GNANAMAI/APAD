import type { User } from "../types/api";

const TOKEN_KEY = "apad_token";
const USER_KEY = "apad_user";
const FLOW_KEY = "apad_flow";

export interface FlowContext {
  mobile?: string;
  token?: string;
  otpForScreen?: string;
  maskedMobile?: string;
  /** User opened ad flow from login SMS link — OTP entry stays on main site */
  fromLogin?: boolean;
  loginSmsPreview?: string;
}

export function saveAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearFlow();
}

export function saveFlow(ctx: FlowContext): void {
  localStorage.setItem(FLOW_KEY, JSON.stringify(ctx));
}

export function getFlow(): FlowContext {
  const raw = localStorage.getItem(FLOW_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as FlowContext;
  } catch {
    return {};
  }
}

export function clearFlow(): void {
  localStorage.removeItem(FLOW_KEY);
}

export function isAdmin(): boolean {
  return getUser()?.role === "admin";
}
