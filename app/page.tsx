import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icon } from "./icons";
import { RsvpForm } from "./rsvp-form";
import { rsvpIsClosed, wedding } from "./wedding";

async function WeddingRsvp() {
  await connection();
  return <RsvpForm initiallyClosed={rsvpIsClosed()} />;
}

export default function Home() {
  return (
    <>
      <header className="site-header" id="top">
        <a className="monogram" href="#top" aria-label="Nña and Tylor, back to top">
          <span>N</span><Icon name="heart" size={14} /><span>T</span>
        </a>
        <a className="nav-rsvp" href="#rsvp">RSVP</a>
      </header>
      <main>
        <section className="hero" aria-labelledby="couple">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Together with their families</p>
            <h1 id="couple">Nña <em>&amp;</em> Tylor</h1>
            <p className="invitation">Please join us as we say “I do.”</p>
            <div className="wedding-details">
              <p className="wedding-detail">
                <span className="detail-icon"><Icon name="calendar" size={19} /></span>
                <time className="detail-copy" dateTime={wedding.startsAt}>
                  <span>{wedding.weekday} · {wedding.time}</span>
                  <strong>{wedding.date}</strong>
                </time>
              </p>
              <p className="wedding-detail">
                <span className="detail-icon"><Icon name="pin" size={19} /></span>
                <span className="detail-copy">
                  <span>Venue</span>
                  <strong>{wedding.venue}</strong>
                </span>
              </p>
            </div>
            <a className="button primary hero-button" href="#rsvp">
              <Icon name="mail" size={18} /> RSVP for the wedding
            </a>
          </div>
          <figure className="hero-visual">
            <div className="photo">
              <Image src="/wedding-flowers.webp" alt="Blush roses and gold wedding rings on ivory linen" fill sizes="(max-width: 760px) 92vw, 470px" preload />
            </div>
            <span className="photo-seal" aria-hidden="true"><Icon name="heart" size={25} /></span>
          </figure>
        </section>

        <section className="rsvp" id="rsvp" aria-labelledby="rsvp-title">
          <div className="section-ornament" aria-hidden="true"><span /><Icon name="heart" size={22} /><span /></div>
          <h2 id="rsvp-title">Kindly <em>RSVP</em></h2>
          <p className="rsvp-intro">Please reply by <strong>{wedding.deadline}</strong>.</p>
          <Suspense fallback={<div className="rsvp-card">Loading RSVP…</div>}>
            <WeddingRsvp />
          </Suspense>
        </section>
      </main>
      <footer>
        <Icon name="heart" size={17} />
        <p>With love, <span>{wedding.couple}</span></p>
      </footer>
    </>
  );
}
