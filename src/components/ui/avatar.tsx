import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { container: "h-8 w-8 text-xs", img: 32 },
  md: { container: "h-10 w-10 text-sm", img: 40 },
  lg: { container: "h-14 w-14 text-lg", img: 56 },
};

/** Deterministic pastel color from name string */
function avatarColor(name: string) {
  const colors = [
    "bg-moss/20 text-moss",
    "bg-ember/20 text-ember",
    "bg-gold/20 text-[#8a6a1a]",
    "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
    "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const FREE_DOMAINS = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"]);

function extractDomain(email?: string | null): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1].toLowerCase();
  if (FREE_DOMAINS.has(domain)) return null;
  return domain;
}

export function Avatar({ name, src, email, size = "md", className }: AvatarProps) {
  const { container, img } = sizeMap[size];
  const [imgError, setImgError] = React.useState(false);

  const domain = extractDomain(email);
  const finalSrc = src ?? (domain && !imgError ? `https://logo.clearbit.com/${domain}` : null);

  if (finalSrc) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-2xl bg-white", container, className)}>
        <Image
          src={finalSrc}
          alt={name}
          width={img}
          height={img}
          className="object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
          placeholder={src ? "blur" : "empty"} // clearbit does not support blur properly unless we do a proxy
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center rounded-2xl font-semibold",
        container,
        avatarColor(name),
        className
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
