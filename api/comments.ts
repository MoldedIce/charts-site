import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase, isAuthorized } from "./_lib";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "POST") {
    const { idea_id, content } = req.body;
    const supabase = getSupabase();
    const { error } = await supabase.from("comments").insert([{ idea_id, content }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
