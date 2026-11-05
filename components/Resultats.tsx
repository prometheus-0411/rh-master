// Affichage des étapes 2 à 4 (lecture recruteur, valeur marché, négociation), repris de la maquette MVP 0.1.
import type { Analyse, AvisPretention, Dossier, Marche, NiveauPretention } from "@/lib/types";
import { k } from "@/lib/fiche";
import { Rich } from "./Rich";

export function VueLecture({ a }: { a: Analyse }) {
  const nivTxt = { fort: "Profil solide", moyen: "Avec réserves", faible: "Écart important" }[a.verdictNiveau];
  return (
    <>
      <div className="verdict">
        <div className="stack">
          <span className={`pill ${a.verdictNiveau}`}>{nivTxt}</span>
          <Rich text={a.verdict} as="p" className="v" />
        </div>
        <div className="score">
          <span className="label">Adéquation à l&apos;offre</span>
          <span className="num">
            {a.adequation}
            <small> / 100</small>
          </span>
          <div className="meter" role="img" aria-label={`Adéquation ${a.adequation} sur 100`}>
            <i style={{ width: `${a.adequation}%` }} />
          </div>
        </div>
      </div>
      <div className="stack">
        <span className="label">Ce qu&apos;il retient en 30 secondes</span>
        <Rich text={a.lecture30s} as="p" className="thirty" />
      </div>
      <div className="grid2">
        <div className="stack">
          <h3>Forces visibles</h3>
          <ul className="items plus">
            {a.forces.map((f, n) => (
              <li key={n}>
                <Rich text={f.point} className="main" />
                <Rich text={f.preuve} className="sub" />
              </li>
            ))}
          </ul>
        </div>
        <div className="stack">
          <h3>Signaux faibles</h3>
          <ul className="items minus">
            {a.signauxFaibles.map((f, n) => (
              <li key={n}>
                <Rich text={f.point} className="main" />
                <Rich text={f.lecture} className="sub" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="stack">
        <h3>Écarts à traiter</h3>
        <p className="chip-help">
          <span>
            <span className="chip presentation">Présentation</span> se corrige en quelques jours
          </span>
          <span>
            <span className="chip competence">Compétence</span> se comble en plusieurs mois
          </span>
        </p>
        <div className="tbl-scroll">
          <table className="ecarts">
            <thead>
              <tr>
                <th>Écart</th>
                <th>Nature</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {a.ecarts.map((e, n) => (
                <tr key={n}>
                  <td className="e">
                    <Rich text={e.ecart} />
                  </td>
                  <td>
                    <span className={`chip ${e.type}`}>{e.type === "competence" ? "Compétence" : "Présentation"}</span>
                  </td>
                  <td className="a">
                    <Rich text={e.action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="stack">
        <h3>Questions probables en entretien</h3>
        <ol className="qs">
          {a.questionsProbables.map((q, n) => (
            <li key={n}>
              <Rich text={q.question} />
              <br />
              <span className="muted">Ce qu&apos;il vérifie : {q.verifie}</span>
            </li>
          ))}
        </ol>
      </div>
      {a.reformulation && (
        <div className="stack">
          <h3>Accroche proposée</h3>
          <Rich text={a.reformulation} as="blockquote" />
        </div>
      )}
    </>
  );
}

function Fourchette({ m, d }: { m: Marche; d: Dossier }) {
  const f = m.fourchette!;
  const pins = [
    { cls: "anc", lbl: "Ancrage proposé", v: m.ancrage.montant },
    { cls: "pre", lbl: "Votre prétention", v: d.pretention },
    { cls: "act", lbl: "Salaire actuel", v: d.actuel },
  ].filter((p): p is { cls: string; lbl: string; v: number } => p.v != null && p.v > 0);
  const all = [f.bas, f.haut, ...pins.map((p) => p.v)];
  const span0 = Math.max(...all) - Math.min(...all);
  const pad = Math.max(2, span0 * 0.12);
  const lo = Math.floor(Math.min(...all) - pad);
  const hi = Math.ceil(Math.max(...all) + pad);
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const step = hi - lo > 40 ? 10 : hi - lo > 16 ? 5 : 2;
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) if (pos(t) > 4 && pos(t) < 96) ticks.push(t);
  const val = (p: number, txt: string) => (
    <span className="dval" style={p > 72 ? { right: `${100 - p}%`, marginRight: 14 } : { left: `${p}%`, marginLeft: 14 }}>
      {txt}
    </span>
  );
  return (
    <div className="tbl-scroll">
      <div className="range" role="img" aria-label={`Fourchette de ${f.bas} à ${f.haut} k€, médian ${f.median} k€`}>
        <span className="rl">Fourchette {m.sourcee ? "sourcée" : "estimée"}</span>
        <div className="track">
          <div className="band" style={{ left: `${pos(f.bas)}%`, width: `${pos(f.haut) - pos(f.bas)}%` }}>
            <span className="med" style={{ left: `${((f.median - f.bas) / Math.max(1, f.haut - f.bas)) * 100}%` }} />
          </div>
        </div>
        {pins.map((p) => (
          <FragmentPin key={p.cls} lbl={p.lbl}>
            <span className={`dot ${p.cls}`} style={{ left: `${pos(p.v)}%` }} />
            {val(pos(p.v), k(p.v))}
          </FragmentPin>
        ))}
        <span className="rl">k€ brut/an</span>
        <div className="axis">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${pos(t)}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FragmentPin({ lbl, children }: { lbl: string; children: React.ReactNode }) {
  return (
    <>
      <span className="rl">{lbl}</span>
      <div className="track">{children}</div>
    </>
  );
}

export function VueMarche({ m, d }: { m: Marche; d: Dossier }) {
  return (
    <>
      {m.fourchette && (
        <div className="figs">
          <div className="fig">
            <span className="label">Bas</span>
            <span className="big">{k(m.fourchette.bas)}</span>
          </div>
          <div className="fig">
            <span className="label">Médian</span>
            <span className="big hl">{k(m.fourchette.median)}</span>
          </div>
          <div className="fig">
            <span className="label">Haut</span>
            <span className="big">{k(m.fourchette.haut)}</span>
          </div>
          <div className="fig">
            <span className="label">Poste · zone</span>
            <span>
              {m.poste} · {m.zone}
            </span>
          </div>
        </div>
      )}
      {m.fourchette ? <Fourchette m={m} d={d} /> : <p className="err">Fourchette non fournie. Relancez l&apos;estimation.</p>}
      <div className="stack">
        <span>
          {m.sourcee ? <span className="badge src">Données web consultées</span> : <span className="badge est">Estimation</span>}
        </span>
        <Rich text={m.baseEstimation} as="p" className={`note${m.sourcee ? " sourcee" : ""}`} />
        {m.sources.length > 0 && (
          <ul className="sources">
            {m.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.titre}
                </a>
              </li>
            ))}
          </ul>
        )}
        {m.sourcee && <p className="muted">Vérifiez la date et le périmètre de chaque source avant de vous en servir en négociation.</p>}
      </div>
      <div className="grid2">
        <div className="stack">
          <h3>Niveau perçu aujourd&apos;hui</h3>
          <Rich text={m.niveauPercu} as="p" />
        </div>
        <div className="stack">
          <h3>Niveau que vous pouvez viser</h3>
          <Rich text={m.niveauVisable} as="p" />
        </div>
      </div>
      {m.avantages.length > 0 && (
        <div className="stack">
          <h3>Leviers hors salaire</h3>
          <ul className="items">
            {m.avantages.map((x, n) => (
              <li key={n}>
                <Rich text={x} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

const NIVEAUX_PRETENTION: Record<NiveauPretention, { txt: string; cls: string }> = {
  sous_evaluee: { txt: "Sous-évaluée", cls: "moyen" },
  realiste: { txt: "Réaliste", cls: "fort" },
  ambitieuse: { txt: "Ambitieuse", cls: "moyen" },
  hors_marche: { txt: "Hors marché", cls: "faible" },
};

function AvisSurPretention({ a, p }: { a: AvisPretention; p: number | null }) {
  const n = NIVEAUX_PRETENTION[a.niveau];
  const ecart =
    a.ecartPct < 0 ? `${-a.ecartPct} % sous le bas de la fourchette` : a.ecartPct > 0 ? `${a.ecartPct} % au-dessus du haut de la fourchette` : "dans la fourchette";
  return (
    <section className="avis-pret stack" aria-label="Avis sur votre prétention">
      <div className="avis-tete">
        <span className="label">Votre prétention{p != null ? ` : ${k(p)}` : ""}</span>
        <span className={`pill ${n.cls}`}>{n.txt}</span>
        <span className="muted">{ecart}</span>
      </div>
      <Rich text={a.message} as="p" />
      {a.cible != null && a.niveau !== "realiste" && (
        <p>
          <strong>À viser maintenant : {k(a.cible)}</strong>
        </p>
      )}
    </section>
  );
}

export function VueNego({ m, pretention = null }: { m: Marche; pretention?: number | null }) {
  return (
    <>
      {m.avisPretention && <AvisSurPretention a={m.avisPretention} p={pretention} />}
      {m.ancrage.montant != null && (
        <div className="anchor">
          <div className="stack">
            <span className="label">Ancrage à annoncer</span>
            <span className="big">{k(m.ancrage.montant)}</span>
          </div>
          <Rich text={m.ancrage.justification} as="p" />
        </div>
      )}
      <div className="stack">
        <h3>Ordre des arguments</h3>
        <ol className="seq">
          {m.arguments.map((x, n) => (
            <li key={n}>
              <Rich text={x} />
            </li>
          ))}
        </ol>
      </div>
      <div className="grid2">
        <div className="stack">
          <h3>À dire</h3>
          <ul className="items say">
            {m.aDire.map((x, n) => (
              <li key={n}>
                <Rich text={x} />
              </li>
            ))}
          </ul>
        </div>
        <div className="stack">
          <h3>À éviter</h3>
          <ul className="items nosay">
            {m.aEviter.map((x, n) => (
              <li key={n}>
                <Rich text={x} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="stack">
        <h3>Objections probables</h3>
        <div className="objs">
          {m.objections.map((o, n) => (
            <div className="obj" key={n}>
              <Rich text={o.objection} className="q" />
              <Rich text={o.reponse} />
            </div>
          ))}
        </div>
      </div>
      {m.prochaineAction && (
        <div className="next">
          <span className="label">Prochaine action</span>
          <Rich text={m.prochaineAction} as="p" />
        </div>
      )}
    </>
  );
}
