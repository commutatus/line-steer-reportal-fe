const ENV_PREFIX: Record<string, string> = {
  staging: "[STG] | ",
  beta: "[BETA] | ",
  dev: "[DEV] | ",
  prod: "",
};

const env = process.env.NEXT_PUBLIC_APP_ENV || "prod";
const prefix = ENV_PREFIX[env] ?? "";

export function getPageTitle(title: string): string {
  return `${prefix}${title}`;
}