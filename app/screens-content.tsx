import { Fragment } from "react";
import Link from "next/link";
import { ArrowIcon } from "./icons";
import type { Locale } from "./locale";
import { tourApps, type TourApp, type TourGroup, type TourItem } from "./screens-data";

const ui = {
  tr: {
    crumbHome: "Anasayfa",
    crumbApps: "Uygulamalar",
    crumbTour: "Ekran turu",
    title: "Ekran turu",
    menuLabel: "Menü bölümleri",
    detailCta: "Uygulama detayları",
    privacyCta: "Gizlilik",
    supportCta: "Destek",
    shotAlt: "ekran görüntüsü"
  },
  en: {
    crumbHome: "Home",
    crumbApps: "Apps",
    crumbTour: "Screen tour",
    title: "Screen tour",
    menuLabel: "Menu sections",
    detailCta: "App details",
    privacyCta: "Privacy",
    supportCta: "Support",
    shotAlt: "screenshot"
  }
};

function TourCard({ item, app, group, locale }: { item: TourItem; app: TourApp; group: TourGroup; locale: Locale }) {
  const t = ui[locale];
  const shots = item.images ?? [];
  const classes = ["tour-card"];
  if (shots.length > 1) classes.push(`multi-${Math.min(shots.length, 3)}`);
  if (shots.length === 0) classes.push("text-only");

  return (
    <article className={classes.join(" ")} id={`${group.id}-${item.id}`}>
      {shots.length > 0 && (
        <div className="tour-shots">
          {shots.map((name) => {
            const base = `/images/screens/${app.slug}/${name}`;
            const alt = `${app.name[locale]} — ${item.title[locale]} ${t.shotAlt}`;
            const lightOnly = app.lightOnly?.includes(name);
            return (
              <Fragment key={name}>
                <img
                  className={lightOnly ? "tour-shot" : "tour-shot is-light"}
                  src={`${base}.webp`}
                  alt={alt}
                  width={540}
                  height={1099}
                  loading="lazy"
                  decoding="async"
                />
                {!lightOnly && (
                  <img
                    className="tour-shot is-dark"
                    src={`${base}-dark.webp`}
                    alt={alt}
                    width={540}
                    height={1099}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      )}
      <div className="tour-copy">
        <h3>
          {item.title[locale]}
          {item.tag && <span className="tour-tag">{item.tag[locale]}</span>}
        </h3>
        <p>{item.text[locale]}</p>
      </div>
    </article>
  );
}

function TourListGroup({ group, locale }: { group: TourGroup; locale: Locale }) {
  return (
    <ul className="tour-list">
      {group.items.map((item) => (
        <li key={item.id}>
          <strong>{item.title[locale]}</strong>
          <span>{item.text[locale]}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Screen-by-screen tour of one app — every menu entry with a short sentence
 * and a (blurred) capture. All content comes from screens-data.ts.
 */
export function AppScreens({ locale, slug }: { locale: Locale; slug: TourApp["slug"] }) {
  const t = ui[locale];
  const app = tourApps[slug];
  const detailHref = `/${locale}/apps/${slug}/`;

  return (
    <main className="doc container">
      <header className="doc-hdr">
        <div className="breadcrumb">
          <Link href={`/${locale}/`}>{t.crumbHome}</Link>
          <span>/</span>
          <Link href={`/${locale}/apps/`}>{t.crumbApps}</Link>
          <span>/</span>
          <Link href={detailHref}>{app.name[locale]}</Link>
          <span>/</span>
          <span>{t.crumbTour}</span>
        </div>

        <div className="app-hero">
          <img
            className="app-tile-icon lg"
            src={app.icon}
            alt={`${app.name[locale]} app logo`}
            width={app.iconSize}
            height={app.iconSize}
          />
          <div className="meta-stack">
            <span className="kicker">
              <span className="dot" />
              {app.name[locale]}
            </span>
            <h1>{t.title}</h1>
          </div>
        </div>
        <p className="meta">{app.intro[locale]}</p>
        <p className="tour-note">{app.note[locale]}</p>

        <nav className="tour-nav" aria-label={t.menuLabel}>
          {app.groups.map((group) => (
            <a className="platform-chip" href={`#${group.id}`} key={group.id}>
              {group.title[locale]}
            </a>
          ))}
        </nav>

        <div className="actions-row">
          <Link className="btn" href={detailHref}>
            {t.detailCta} <ArrowIcon />
          </Link>
        </div>
      </header>

      {app.groups.map((group) => (
        <section className="doc-section tour-group" id={group.id} aria-label={group.title[locale]} key={group.id}>
          <h2>{group.title[locale]}</h2>
          {group.intro && <p>{group.intro[locale]}</p>}
          {group.layout === "list" ? (
            <TourListGroup group={group} locale={locale} />
          ) : (
            <div className="tour-grid">
              {group.items.map((item) => (
                <TourCard item={item} app={app} group={group} locale={locale} key={item.id} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="doc-section">
        <div className="actions-row" style={{ marginTop: "0.5rem" }}>
          <Link className="btn" href={detailHref}>
            {t.detailCta} <ArrowIcon />
          </Link>
          <Link className="btn" href={`${detailHref}privacy/`}>
            {t.privacyCta}
          </Link>
          <Link className="btn" href={`${detailHref}support/`}>
            {t.supportCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
