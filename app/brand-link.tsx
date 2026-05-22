"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BrandLink() {
  const pathname = usePathname();
  const href = pathname.startsWith("/en") ? "/en/" : "/tr/";

  return (
    <Link className="brand" href={href}>
      <span className="brand-mark" aria-hidden="true">
        M
      </span>
      <span className="brand-name">Mehmet Gümrah</span>
    </Link>
  );
}
