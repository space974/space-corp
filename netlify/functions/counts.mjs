// Petit serveur Netlify : va lire tes abonnés TikTok et Snapchat sur tes profils publics.
// Si un réseau bloque, il renvoie null et la page garde le dernier chiffre connu.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function lire(url, regex) {
  try {
    // "_r" + no-cache : force TikTok à renvoyer la version à jour, pas une vieille copie
    const sep = url.includes("?") ? "&" : "?";
    const r = await fetch(url + sep + "_r=" + Date.now(), {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9", "Cache-Control": "no-cache", "Pragma": "no-cache" },
    });
    if (!r.ok) return null;
    const m = (await r.text()).match(regex);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

export default async () => {
  const [tiktok, snapchat] = await Promise.all([
    lire("https://www.tiktok.com/@_space974_", /"statsV2":\{"followerCount":"(\d+)"/),
    lire("https://www.snapchat.com/@space_974", /"subscriberCount":"?(\d+)/),
  ]);
  return Response.json(
    { tiktok, snapchat, date: new Date().toISOString() },
    {
      headers: {
        // Netlify garde la réponse 2 min en cache : ça économise tes crédits gratuits
        "Cache-Control": "public, max-age=60",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=120, stale-while-revalidate=600",
      },
    }
  );
};

export const config = { path: "/api/counts" };
