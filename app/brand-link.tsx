"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BrandLink() {
  const pathname = usePathname();
  const href = pathname.startsWith("/en") ? "/en/" : "/tr/";

  return (
    <Link className="brand" href={href}>
      Mehmet Gümrah
    </Link>
  );
}
