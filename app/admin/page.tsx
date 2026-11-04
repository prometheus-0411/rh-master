"use client";
// APP-12 : page réservée au concepteur. Retours testeurs et consommation des codes.
import { useState } from "react";

interface RetourAdmin {
  code: string;
  note: number;
  juste?: number | null;
  reco?: string;
  etape: string;
  manque: string;
  mode: string;
  version: string;
  envoyeLe: number;
}
interface Donnees {
  retours: RetourAdmin[];
  codes: { code: string; limite: number; utilise: number }[];
  aujourdhui: number;
  limiteJour: number;
  persistant: boolean;
}
const ETAPES: Record<string, string> = { lecture: "Lecture recruteur", marche: "Valeur marché", nego: "Négociation", synthese: "Fiche" };

export default function Admin() {
  const [mdp, setMdp] = useState("");
  const [data, setData] = useState<Donnees | null>(null);
  const [err, setErr] = useState("");

  async function charger(e?: React.FormEvent) {
    e?.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/retours", { headers: { "x-admin": mdp } }).catch(() => null);
    if (!r?.ok) return setErr(r?.status === 401 ? "Mot de passe incorrect (variable ADMIN_CODE)." : "Chargement impossible.");
    setData(await r.json());
  }

  const moy = data?.retours.length ? data.retours.reduce((s, r) => s + (Number(r.note) || 0), 0) / data.retours.length : null;
  const justes = data?.retours.filter((r) => r.juste) ?? [];
  const moyJuste = justes.length ? justes.reduce((s, r) => s + Number(r.juste), 0) / justes.length : null;
  const recos = data?.retours.filter((r) => r.reco === "oui" || r.reco === "non") ?? [];
  const recoOui = recos.filter((r) => r.reco === "oui").length;
  const f1 = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

  return (
    <div className="wrap admin">
      <header className="top">
        <div className="brand">
          <h1>
            RH <span className="hl">Master</span>
          </h1>
          <p>Espace concepteur : retours testeurs et consommation.</p>
        </div>
        <a className="tag" href="/">
          ← Retour à l&apos;app
        </a>
      </header>

      {!data ? (
        <form className="panel" onSubmit={charger}>
          <div className="field">
            <label className="lbl" htmlFor="mdp">
              Mot de passe administrateur
            </label>
            <input id="mdp" type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="actions">
            <button className="btn primary" type="submit">
              Ouvrir
            </button>
          </div>
          {err && <p className="err">{err}</p>}
        </form>
      ) : (
        <>
          {!data.persistant && (
            <div className="nolive">
              <strong>Base de données non connectée.</strong>
              <p>Les retours et compteurs sont gardés en mémoire et seront perdus au prochain redémarrage. Voir le README, étape « Base de données ».</p>
            </div>
          )}
          <section className="panel">
            <div className="field-top">
              <h2>Retours testeurs</h2>
              <button className="btn" type="button" onClick={() => charger()}>
                Actualiser
              </button>
            </div>
            {data.retours.length ? (
              <p>
                <strong>
                  {data.retours.length} retour{data.retours.length > 1 ? "s" : ""}
                </strong>{" "}
                · utilité {f1(moy!)} / 5
                {moyJuste != null && <> · justesse {f1(moyJuste)} / 5</>}
                {recos.length > 0 && (
                  <>
                    {" "}· recommandé par {recoOui} sur {recos.length}
                  </>
                )}
              </p>
            ) : (
              <p className="muted">Aucun retour pour l&apos;instant.</p>
            )}
            {data.retours.map((r) => (
              <div className="rv" key={r.code}>
                <span className="meta">
                  {r.code} · utilité {r.note}/5{r.juste ? ` · justesse ${r.juste}/5` : ""}{r.reco ? ` · recommande : ${r.reco}` : ""} · {ETAPES[r.etape] ?? "étape non précisée"} · {r.mode === "exemple" ? "sur l'exemple" : "sur son dossier"} · v{r.version} ·{" "}
                  {new Date(r.envoyeLe).toLocaleString("fr-FR")}
                </span>
                {r.manque ? <p>{r.manque}</p> : <p className="muted">Sans commentaire.</p>}
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Consommation</h2>
            <p>
              Aujourd&apos;hui : <strong>{data.aujourdhui}</strong> appel{data.aujourdhui > 1 ? "s" : ""} à Claude sur {data.limiteJour} autorisés.
            </p>
            <div className="tbl-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Utilisés</th>
                    <th>Limite</th>
                  </tr>
                </thead>
                <tbody>
                  {data.codes.map((c) => (
                    <tr key={c.code}>
                      <td>{c.code}</td>
                      <td>{c.utilise}</td>
                      <td>{c.limite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted">Un appel = une lecture recruteur, une estimation marché, une lecture de lien ou une retranscription de PDF.</p>
          </section>
        </>
      )}
    </div>
  );
}
