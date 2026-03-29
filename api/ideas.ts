import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

function isAuthorized(req: VercelRequest): boolean {
  return req.headers["authorization"] === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data: ideas, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const withComments = (ideas ?? []).map((idea) => ({
      ...idea,
      comments: comments?.filter((c) => c.idea_id === idea.id) ?? [],
    }));

    return res.status(200).json(withComments);
  }

  if (req.method === "POST") {
    const { title, description, category, status, priority } = req.body;
    const { error } = await supabase.from("ideas").insert([{ title, description, category, status, priority }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
