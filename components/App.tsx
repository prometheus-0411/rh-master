"use client";
// Parcours en 5 étapes : Dossier → Lecture recruteur → Valeur marché → Négociation → Synthèse et retour.
import { useEffect, useRef, useState } from "react";
import type { Analyse, Dossier, Marche } from "@/lib/types";
import { SITUATIONS } from "@/lib/types";
import { EX_ANALYSE, EX_DOSSIER, EX_MARCHE } from "@/lib/exemple";
import { ErreurAppel, appelApi, codeMemorise, memoriserCode } from "@/lib/api";
import { message } from "@/lib/messages";
import { fiche, k } from "@/lib/fiche";
import { imagesDuPdf, ouvrirPdf, texteDuPdf } from "@/lib/pdf";
import { VueLecture, VueMarche, VueNego } from "./Resultats";

type Step = "dossier" | "lecture" | "marche" | "nego" | "synthese";
const STEPS: { id: Step; label: string; short: string }[] = [
  { id: "dossier", label: "Dossier", short: "Dossier" },
  { id: "lecture", label: "Lecture recruteur", short: "Lecture" },
  { id: "marche", label: "Valeur marché", short: "Marché" },
  { id: "nego", label: "Négociation", short: "Négo" },
  { id: "synthese", label: "Synthèse et retour", short: "Synthèse" },
];
const VIDE: Dossier = { cv: "", offre: "", type: "candidature", actuel: null, pretention: null, zone: "Lyon" };

type Ou = "dossier" | "lecture" | "marche" | "acces";
interface Err {
  where: Ou;
  code: string;
}

export default function App() {
  const [mode, setMode] = useState<"exemple" | "direct">("exemple");
  const [step, setStep] = useState<Step>("dossier");
  const [d, setD] = useState<Dossier>(EX_DOSSIER);
  const [analyse, setAnalyse] = useState<Analyse | null>(EX_ANALYSE);
  const [marche, setMarche] = useState<Marche | null>(EX_MARCHE);
  const [busy, setBusy] = useState<"analyse" | "marche" | null>(null);
  const [err, setErr] = useState<Err | null>(null);
  const [web, setWeb] = useState(true);
  const [code, setCode] = useState("");
  const [restant, setRestant] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const ctl = useRef<AbortController | null>(null);

  useEffect(() => {
    const c = codeMemorise();
    if (c) verifierCode(c, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notifier(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  }
  function go(s: Step) {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function verifierCode(c: string, silencieux = false) {
    const v = c.trim().toUpperCase();
    if (!v) return;
    try {
      const r = await appelApi<{ restant: number }>("/api/acces", {}, v);
      setCode(v);
      setRestant(r.restant);
      memoriserCode(v);
      if (err?.where === "acces" || err?.code === "code_requis") setErr(null);
      if (!silencieux) notifier("Code accepté");
    } catch (e) {
      memoriserCode("");
      setCode("");
      if (!silencieux) setErr({ where: "acces", code: (e as ErreurAppel).code });
    }
  }

  async function lancerAnalyse() {
    if (d.cv.trim().length < 150 || d.offre.trim().length < 80) return setErr({ where: "dossier", code: "dossier_incomplet" });
    if (!code) return setErr({ where: "dossier", code: "code_requis" });
    setMode("direct");
    setAnalyse(null);
    setMarche(null);
    setErr(null);
    setBusy("analyse");
    setStep("lecture");
    ctl.current = new AbortController();
    try {
      const r = await appelApi<{ analyse: Analyse; restant: number }>("/api/analyse", { dossier: d }, code, ctl.current.signal);
      setAnalyse(r.analyse);
      setRestant(r.restant);
    } catch (e) {
      setErr({ where: "lecture", code: (e as ErreurAppel).code });
    } finally {
      setBusy(null);
    }
  }

  async function lancerMarche() {
    if (!analyse || !code) return setErr({ where: "marche", code: "code_requis" });
    setErr(null);
    setBusy("marche");
    setMarche(null);
    if (step !== "nego") setStep("marche");
    ctl.current = new AbortController();
    try {
      const r = await appelApi<{ marche: Marche; restant: number }>("/api/marche", { dossier: d, analyse, web }, code, ctl.current.signal);
      setMarche(r.marche);
      setRestant(r.restant);
    } catch (e) {
      setErr({ where: "marche", code: (e as ErreurAppel).code });
    } finally {
      setBusy(null);
    }
  }

  function chargerExemple() {
    ctl.current?.abort();
    setMode("exemple");
    setD(EX_DOSSIER);
    setAnalyse(EX_ANALYSE);
    setMarche(EX_MARCHE);
    setErr(null);
    setBusy(null);
    setStep("dossier");
  }
  function monDossier() {
    ctl.current?.abort();
    setMode("direct");
    setD(VIDE);
    setAnalyse(null);
    setMarche(null);
    setErr(null);
    setBusy(null);
    setStep("dossier");
  }

  const dispo = (s: Step) =>
    s === "dossier" ||
    (s === "lecture" && (analyse || busy === "analyse" || err?.where === "lecture")) ||
    ((s === "marche" || s === "nego" || s === "synthese") && !!analyse);

  const errBox = (where: Ou, retry?: () => void) =>
    err?.where === where ? (
      <div className="stack">
        <p className="err" role="alert">
          {message(err.code)}
        </p>
        {retry && !["code_invalide", "quota_atteint", "limite_jour", "config", "base_absente", "code_requis"].includes(err.code) && (
          <div className="actions">
            <button className="btn" type="button" onClick={retry}>
              Relancer
            </button>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>
            RH <span className="hl">Master</span>
          </h1>
          <p>Votre CV lu par un recruteur, votre valeur sur le marché, votre négociation préparée.</p>
        </div>
        <span className="tag">Version test · v0.2</span>
      </header>

      <nav className="steps-scroll" aria-label="Étapes">
        <ol className="steps">
          {STEPS.map((s, n) => (
            <li key={s.id}>
              <button type="button" disabled={!dispo(s.id)} aria-current={step === s.id ? "step" : undefined} onClick={() => go(s.id)}>
                <span className="n">{n + 1}</span>
                <span className="full">{s.label}</span>
                <span className="short">{s.short}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mode">
        {mode === "exemple" ? (
          <>
            <p>
              <strong>Exemple chargé. </strong>Profil et offre fictifs, résultats pré-calculés : parcourez les étapes librement.
            </p>
            <button className="btn primary" type="button" onClick={monDossier}>
              Analyser mon dossier
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Votre dossier. </strong>
              {code ? (
                <>
                  Code <strong>{code}</strong>
                  {restant != null && <span className="restant"> · {restant} appel{restant > 1 ? "s" : ""} restant{restant > 1 ? "s" : ""}</span>}{" "}
                  <button className="btn ghost" type="button" onClick={() => (memoriserCode(""), setCode(""), setRestant(null))}>
                    changer
                  </button>
                </>
              ) : (
                "Saisissez le code d'accès testeur que vous avez reçu."
              )}
            </p>
            <button className="btn" type="button" onClick={chargerExemple}>
              Revoir l&apos;exemple
            </button>
            {!code && <SaisieCode onValider={verifierCode} />}
            {errBox("acces")}
          </>
        )}
      </div>

      <main>
        {step === "dossier" && (
          <EtapeDossier
            d={d}
            setD={setD}
            mode={mode}
            code={code}
            busy={!!busy}
            onRestant={setRestant}
            onLancer={lancerAnalyse}
            onExemple={chargerExemple}
            onParcourir={() => go("lecture")}
            erreur={errBox("dossier")}
            analyse={analyse}
            marche={marche}
          />
        )}

        {step === "lecture" && (
          <section className="panel">
            <Tete eyebrow="Étape 2" titre="Lecture recruteur" sous="Ce qu'un recruteur voit dans votre CV face à cette offre." />
            {busy === "analyse" ? (
              <Chargement titre="Lecture du dossier en cours" onStop={() => ctl.current?.abort()} />
            ) : analyse ? (
              <>
                <VueLecture a={analyse} />
                <ChoixWeb web={web} setWeb={setWeb} visible={mode === "direct" && !marche} />
                <div className="actions">
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => (!marche && mode !== "exemple" ? lancerMarche() : go("marche"))}
                  >
                    Estimer ma valeur et préparer la négociation →
                  </button>
                </div>
              </>
            ) : (
              errBox("lecture", lancerAnalyse) || <p className="muted">Lancez l&apos;analyse depuis l&apos;étape 1.</p>
            )}
          </section>
        )}

        {(step === "marche" || step === "nego") && (
          <section className="panel">
            {step === "marche" ? (
              <Tete eyebrow="Étape 3" titre="Valeur marché" sous="Où se situe votre profil pour ce poste, en brut annuel." />
            ) : (
              <Tete eyebrow="Étape 4" titre="Négociation" sous="Le montant à annoncer, l'ordre des arguments et les réponses aux objections." />
            )}
            {busy === "marche" ? (
              <Chargement
                titre="Estimation de la valeur et préparation de la négociation"
                detail={web ? "Recherche de données de salaire récentes, puis préparation de la stratégie. Comptez 1 à 3 minutes." : undefined}
                onStop={() => ctl.current?.abort()}
              />
            ) : !marche ? (
              errBox("marche", lancerMarche) || (
                <div className="stack">
                  <p className="muted">Cette étape s&apos;appuie sur la lecture recruteur de votre dossier.</p>
                  <ChoixWeb web={web} setWeb={setWeb} visible />
                  <div className="actions">
                    <button className="btn primary" type="button" onClick={lancerMarche} disabled={!code}>
                      Lancer l&apos;estimation
                    </button>
                  </div>
                </div>
              )
            ) : step === "marche" ? (
              <>
                <VueMarche m={marche} d={d} />
                <div className="actions">
                  <button className="btn primary" type="button" onClick={() => go("nego")}>
                    Préparer la négociation →
                  </button>
                </div>
              </>
            ) : (
              <>
                <VueNego m={marche} />
                <div className="actions">
                  <button className="btn primary" type="button" onClick={() => go("synthese")}>
                    Voir la fiche de synthèse →
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {step === "synthese" && (
          <EtapeSynthese md={fiche(mode, d, analyse, marche)} mode={mode} code={code} notifier={notifier} />
        )}
      </main>

      <p className="foot">
        RH Master structure et éclaire ; la décision reste la vôtre. Les fourchettes de salaire sont à vérifier sur des offres récentes.
      </p>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function Tete({ eyebrow, titre, sous }: { eyebrow: string; titre: string; sous?: string }) {
  return (
    <div className="panel-head">
      <span className="label">{eyebrow}</span>
      <h2>{titre}</h2>
      {sous && <p className="muted">{sous}</p>}
    </div>
  );
}

function Chargement({ titre, detail, onStop }: { titre: string; detail?: string; onStop: () => void }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading">
      <h3>{titre}</h3>
      <div className="bar" />
      <p className="muted">{detail ?? "Comptez 20 à 60 secondes."}</p>
      <span className="count">{s} s écoulées</span>
      <button className="btn" type="button" onClick={onStop}>
        Arrêter
      </button>
    </div>
  );
}

function ChoixWeb({ web, setWeb, visible }: { web: boolean; setWeb: (v: boolean) => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <label className="option">
      <input type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} />
      <span>
        <strong>Chercher des données de salaire récentes sur le web</strong>
        <small>Fourchette appuyée sur des sources citées, au lieu d&apos;une estimation. Plus long (1 à 3 minutes).</small>
      </span>
    </label>
  );
}

function SaisieCode({ onValider }: { onValider: (c: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      className="acces"
      onSubmit={(e) => {
        e.preventDefault();
        onValider(v);
      }}
    >
      <label className="lbl" htmlFor="code">
        Code d&apos;accès
      </label>
      <input id="code" type="text" autoComplete="off" value={v} onChange={(e) => setV(e.target.value)} placeholder="ex. CAMILLE-4821" />
      <button className="btn primary" type="submit">
        Valider
      </button>
    </form>
  );
}

/* ---------- Étape 1 : dossier ---------- */

function EtapeDossier(p: {
  d: Dossier;
  setD: (f: (d: Dossier) => Dossier) => void;
  mode: "exemple" | "direct";
  code: string;
  busy: boolean;
  onRestant: (n: number) => void;
  onLancer: () => void;
  onExemple: () => void;
  onParcourir: () => void;
  erreur: React.ReactNode;
  analyse: Analyse | null;
  marche: Marche | null;
}) {
  const { d, setD } = p;
  const champ = (cle: keyof Dossier) => (v: string) => setD((x) => ({ ...x, [cle]: v }));
  const nombre = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")) || null);
  const a = p.analyse;
  const m = p.marche;

  return (
    <section className="panel">
      <Tete
        eyebrow="Étape 1"
        titre="Votre dossier"
        sous="Importez votre CV en PDF ou collez son texte, puis faites de même pour l'offre visée, ou donnez simplement le lien de l'offre."
      />
      <div className="grid2">
        <ZoneTexte id="cv" lbl="CV" val={d.cv} set={champ("cv")} ph="Expériences, réalisations, formation, outils…" code={p.code} onRestant={p.onRestant} />
        <div className="stack">
          <ZoneTexte id="offre" lbl="Offre d'emploi" val={d.offre} set={champ("offre")} ph="Intitulé, missions, profil recherché…" code={p.code} onRestant={p.onRestant} />
          <LienOffre code={p.code} onTexte={champ("offre")} onRestant={p.onRestant} />
        </div>
      </div>
      <div className="ctx">
        <div className="field">
          <label className="lbl" htmlFor="type">
            Situation
          </label>
          <select id="type" value={d.type} onChange={(e) => setD((x) => ({ ...x, type: e.target.value as Dossier["type"] }))}>
            {Object.entries(SITUATIONS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="lbl" htmlFor="actuel">
            Salaire actuel (k€ brut/an)
          </label>
          <input id="actuel" type="number" min={10} max={300} inputMode="numeric" placeholder="ex. 38" value={d.actuel ?? ""} onChange={(e) => setD((x) => ({ ...x, actuel: nombre(e.target.value) }))} />
        </div>
        <div className="field">
          <label className="lbl" htmlFor="pretention">
            Prétention envisagée (k€)
          </label>
          <input id="pretention" type="number" min={10} max={300} inputMode="numeric" placeholder="ex. 42" value={d.pretention ?? ""} onChange={(e) => setD((x) => ({ ...x, pretention: nombre(e.target.value) }))} />
        </div>
        <div className="field">
          <label className="lbl" htmlFor="zone">
            Zone
          </label>
          <input id="zone" type="text" value={d.zone} onChange={(e) => champ("zone")(e.target.value)} />
        </div>
      </div>
      <p className="privacy">
        Votre CV n&apos;est jamais enregistré. Un PDF est lu directement dans votre navigateur ; au lancement de l&apos;analyse, le texte est transmis à Claude
        (Anthropic) le temps de la réponse, sans être conservé par RH Master. Il disparaît quand vous fermez la page. Seul le retour que vous choisissez
        d&apos;envoyer à l&apos;étape 5 est conservé, sans votre CV.
      </p>
      {p.erreur}
      <div className="actions">
        <button className="btn primary" type="button" onClick={p.onLancer} disabled={p.busy || p.mode === "exemple"}>
          Lancer la lecture recruteur
        </button>
        {p.mode !== "exemple" && (
          <button className="btn ghost" type="button" onClick={p.onExemple}>
            Revoir l&apos;exemple
          </button>
        )}
      </div>
      {p.mode === "exemple" && a && m && m.fourchette && (
        <section className="stack">
          <span className="label">Ce que donne l&apos;exemple</span>
          <div className="preview">
            <div className="pv">
              <span className="label">Lecture recruteur</span>
              <span className="big">{a.adequation}/100</span>
              <span className="muted">{a.verdict}</span>
            </div>
            <div className="pv">
              <span className="label">Valeur marché</span>
              <span className="big">
                {m.fourchette.bas}–{m.fourchette.haut} k€
              </span>
              <span className="muted">
                {m.poste}, {m.zone}, brut annuel
              </span>
            </div>
            <div className="pv">
              <span className="label">Négociation</span>
              <span className="big">{m.ancrage.montant != null ? k(m.ancrage.montant) : "—"}</span>
              <span className="muted">Ancrage proposé, avec arguments et réponses aux objections</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={p.onParcourir}>
              Parcourir l&apos;exemple →
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function ZoneTexte(p: { id: string; lbl: string; val: string; set: (v: string) => void; ph: string; code: string; onRestant: (n: number) => void }) {
  const [statut, setStatut] = useState<{ t: string; cls?: string } | null>(null);
  const [scan, setScan] = useState<unknown>(null);

  async function importer(f: File) {
    setScan(null);
    const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    if (!isPdf) {
      p.set(await f.text());
      return setStatut({ t: `« ${f.name} » importé.`, cls: "ok" });
    }
    if (f.size > 15 * 1024 * 1024) return setStatut({ t: "Ce PDF dépasse 15 Mo. Exportez une version plus légère ou collez le texte.", cls: "err" });
    setStatut({ t: "Lecture du PDF…" });
    let pdf;
    try {
      pdf = await ouvrirPdf(f);
    } catch (e) {
      return setStatut({
        t: (e as Error)?.name === "PasswordException" ? "Ce PDF est protégé par un mot de passe. Retirez la protection ou collez le texte." : "Ce PDF n'a pas pu être lu. Collez son texte à la place.",
        cls: "err",
      });
    }
    const txt = await texteDuPdf(pdf).catch(() => "");
    if (txt.replace(/\s/g, "").length >= 200) {
      p.set(txt);
      return setStatut({
        t: `Texte extrait de « ${f.name} » (${pdf.numPages} page${pdf.numPages > 1 ? "s" : ""}). Relisez-le : une mise en page en colonnes peut mélanger l'ordre.`,
        cls: "ok",
      });
    }
    // PDF scanné : pas de texte sélectionnable, Claude peut retranscrire les pages
    setScan(pdf);
    setStatut({ t: "Ce PDF est une image scannée, sans texte lisible." });
  }

  async function retranscrire() {
    if (!p.code) return setStatut({ t: message("code_requis"), cls: "err" });
    setStatut({ t: "Retranscription des pages en cours (20 à 60 secondes)…" });
    try {
      const images = await imagesDuPdf(scan, 3);
      const r = await appelApi<{ texte: string; restant: number }>("/api/transcrire", { images }, p.code);
      p.set(r.texte);
      p.onRestant(r.restant);
      setScan(null);
      setStatut({ t: "Texte retranscrit. Relisez-le avant de lancer l'analyse.", cls: "ok" });
    } catch (e) {
      setStatut({ t: message((e as ErreurAppel).code), cls: "err" });
    }
  }

  return (
    <div className="field">
      <div className="field-top">
        <label className="lbl" htmlFor={p.id}>
          {p.lbl}
        </label>
        <span className="actions">
          <span className="count">{p.val.length} car.</span>
          <label className="file">
            Importer PDF ou .txt
            <input
              type="file"
              accept=".pdf,application/pdf,.txt,.md,text/plain,text/markdown"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) importer(f);
              }}
            />
          </label>
        </span>
      </div>
      <textarea id={p.id} placeholder={p.ph} value={p.val} maxLength={15000} onChange={(e) => p.set(e.target.value)} />
      {statut && (
        <p className={`fstat ${statut.cls ?? ""}`} role="status">
          {statut.t}{" "}
          {scan != null && (
            <button className="btn ghost" type="button" onClick={retranscrire}>
              Retranscrire avec Claude
            </button>
          )}
        </p>
      )}
    </div>
  );
}

function LienOffre({ code, onTexte, onRestant }: { code: string; onTexte: (t: string) => void; onRestant: (n: number) => void }) {
  const [url, setUrl] = useState("");
  const [etat, setEtat] = useState<{ t: string; cls?: string } | null>(null);
  const [encours, setEncours] = useState(false);
  async function recuperer() {
    if (!code) return setEtat({ t: message("code_requis"), cls: "err" });
    setEncours(true);
    setEtat({ t: "Lecture de la page de l'offre (10 à 40 secondes)…" });
    try {
      const r = await appelApi<{ texte: string; restant: number }>("/api/offre", { url }, code);
      onTexte(r.texte);
      onRestant(r.restant);
      setEtat({ t: "Texte de l'offre récupéré. Relisez-le, puis complétez si besoin.", cls: "ok" });
    } catch (e) {
      setEtat({ t: message((e as ErreurAppel).code), cls: "err" });
    } finally {
      setEncours(false);
    }
  }
  return (
    <div className="field">
      <label className="lbl" htmlFor="lien">
        Ou le lien de l&apos;offre
      </label>
      <div className="lien">
        <input id="lien" type="url" inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn" type="button" onClick={recuperer} disabled={encours || url.trim().length < 10}>
          Récupérer le texte
        </button>
      </div>
      {etat && (
        <p className={`fstat ${etat.cls ?? ""}`} role="status">
          {etat.t}
        </p>
      )}
    </div>
  );
}

/* ---------- Étape 5 : synthèse et retour ---------- */

function EtapeSynthese({ md, mode, code, notifier }: { md: string; mode: "exemple" | "direct"; code: string; notifier: (t: string) => void }) {
  const [note, setNote] = useState("");
  const [juste, setJuste] = useState("");
  const [reco, setReco] = useState("");
  const [etape, setEtape] = useState("");
  const [manque, setManque] = useState("");
  const [msg, setMsg] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [encours, setEncours] = useState(false);

  function telecharger() {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "exemple" ? "fiche-rh-master-exemple.md" : "fiche-rh-master.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notifier("Fiche téléchargée");
  }
  async function copier() {
    try {
      await navigator.clipboard.writeText(md);
      notifier("Fiche copiée");
    } catch {
      notifier("Copie impossible : sélectionnez le texte à la main");
    }
  }
  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!note) return setMsg("Choisissez une note de 1 à 5.");
    if (!code) return setMsg("L'envoi demande votre code d'accès testeur : cliquez sur « Analyser mon dossier » en haut de page pour le saisir.");
    setEncours(true);
    try {
      await appelApi("/api/retour", { note: Number(note), juste: juste ? Number(juste) : null, reco, etape, manque, mode }, code);
      setEnvoye(true);
      notifier("Retour envoyé, merci");
    } catch (er) {
      setMsg(message((er as ErreurAppel).code));
    } finally {
      setEncours(false);
    }
  }

  const radios = (name: string, val: string, set: (v: string) => void, opts: [string, string][]) => (
    <div className="radios">
      {opts.map(([v, l]) => (
        <label key={v}>
          <input type="radio" name={name} value={v} checked={val === v} onChange={() => set(v)} />
          {l}
        </label>
      ))}
    </div>
  );

  return (
    <section className="panel">
      <Tete eyebrow="Étape 5" titre="Synthèse et retour" sous="Votre fiche à garder, puis votre avis sur cette version test." />
      <pre className="md">{md}</pre>
      <div className="actions">
        <button className="btn primary" type="button" onClick={telecharger}>
          Télécharger la fiche (.md)
        </button>
        <button className="btn" type="button" onClick={copier}>
          Copier
        </button>
      </div>
      <form className="fb" onSubmit={envoyer}>
        {envoye ? (
          <>
            <h3>Votre retour</h3>
            <p className="ok">Retour envoyé. Merci, il sert directement à la prochaine version.</p>
          </>
        ) : (
          <>
            <h3>Votre retour sur cette version test</h3>
            <fieldset>
              <legend>Utilité globale</legend>
              {radios("note", note, setNote, [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]])}
              <span className="count">1 = inutile · 5 = je m&apos;en servirais pour une vraie candidature</span>
            </fieldset>
            <fieldset>
              <legend>Le diagnostic sur votre profil était-il juste ?</legend>
              {radios("juste", juste, setJuste, [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]])}
              <span className="count">1 = à côté · 5 = très juste</span>
            </fieldset>
            <fieldset>
              <legend>Le recommanderiez-vous à un proche ?</legend>
              {radios("reco", reco, setReco, [["oui", "Oui"], ["non", "Non"]])}
            </fieldset>
            <fieldset>
              <legend>L&apos;étape qui vous a le plus servi</legend>
              {radios("etape", etape, setEtape, [
                ["lecture", "Lecture recruteur"],
                ["marche", "Valeur marché"],
                ["nego", "Négociation"],
                ["synthese", "Fiche de synthèse"],
              ])}
            </fieldset>
            <div className="field">
              <label className="lbl" htmlFor="manque">
                Ce qui manque, ce qui vous a gêné ou semblé faux
              </label>
              <textarea id="manque" style={{ minHeight: 110 }} maxLength={2000} placeholder="Une phrase suffit." value={manque} onChange={(e) => setManque(e.target.value)} />
            </div>
            <p className="muted">Seules ces réponses et ce commentaire sont enregistrés, jamais votre CV. Un nouvel envoi remplace le précédent.</p>
            <div className="actions">
              <button className="btn primary" type="submit" disabled={encours}>
                Envoyer mon retour
              </button>
            </div>
            {msg && (
              <p className="err" role="alert">
                {msg}
              </p>
            )}
          </>
        )}
      </form>
    </section>
  );
}
