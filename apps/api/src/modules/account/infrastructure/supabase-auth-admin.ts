import type { AuthAdmin, AuthUser } from "../domain/auth-admin.js";

const PAGE_SIZE = 200;

interface AdminUser {
  id: string;
  email?: string | null;
}

/** Administra contas pela API admin do Supabase Auth (GoTrue), com a chave de serviço. */
export class SupabaseAuthAdmin implements AuthAdmin {
  constructor(
    private readonly baseUrl: string,
    private readonly serviceRoleKey: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const wanted = email.toLowerCase();
    for (let page = 1; ; page++) {
      const body = await this.request<{ users: AdminUser[] }>(
        `/admin/users?page=${page}&per_page=${PAGE_SIZE}`,
      );
      const found = body.users.find((u) => u.email?.toLowerCase() === wanted);
      if (found) return { id: found.id, email: wanted };
      if (body.users.length < PAGE_SIZE) return null;
    }
  }

  async createConfirmedUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.request<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    return { id: user.id, email };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}/auth/v1${path}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });
    // A mensagem fica só com método e status: o corpo e os dados enviados podem ter senha.
    if (!response.ok)
      throw new Error(
        `Supabase Auth admin: ${init.method ?? "GET"} ${path} respondeu ${response.status}`,
      );
    return (await response.json()) as T;
  }
}
