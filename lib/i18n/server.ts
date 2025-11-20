import { cookies } from "next/headers";
import { translationsByLang, Lang } from "./translations";

function resolve(obj: any, path: string) {
  if (!obj || typeof obj !== "object") return undefined;

  if (path in obj) return obj[path];

  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const combined = parts.slice(i).join(".");
    if (combined in current) return current[combined];

    if (part in current) current = current[part];
    else return undefined;
  }

  return current;
}

function interpolate(str: string, params?: Record<string, string | number>) {
  if (!params) return str;
  return Object.keys(params).reduce(
    (s, k) => s.replace(new RegExp(`{${k}}`, "g"), String(params[k])),
    str
  );
}

export async function getServerTranslation() {
  // ⬇️ FIX: cookies() ist jetzt async!
  const cookieStore = await cookies();

  const lang =
    (cookieStore.get("lang")?.value as Lang) ||
    "de";

  function t(key: string, params?: Record<string, string | number>) {
    const fromLang = resolve(translationsByLang[lang], key);
    if (typeof fromLang === "string") return interpolate(fromLang, params);

    const fallback = resolve(translationsByLang.en, key);
    if (typeof fallback === "string") return interpolate(fallback, params);

    return key;
  }

  return { lang, t };
}
