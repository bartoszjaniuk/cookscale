import { encodeHex } from "@std/encoding/hex";

export async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("IP_HASH_SALT") ?? "default-salt-for-dev";
  const data = new TextEncoder().encode(salt + ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(hashBuffer);
}
