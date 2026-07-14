"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPath } from "./locale";

export default function BrandLink() {
  const pathname = usePathname();
  const href = `/${localeFromPath(pathname)}/`;

  return (
    <Link className="brand" href={href}>
      <span className="brand-mark" aria-hidden="true">
        M
      </span>
      <span className="brand-name">Mehmet Gümrah</span>
    </Link>
  );
}
