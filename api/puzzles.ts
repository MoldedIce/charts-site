import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

function isAuthorized(req: VercelRequest): boolean {
  return req.headers["authorization"] === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const supabase = getSupabase();
    const showAll = req.query.all === "true" && isAuthorized(req);

    let query = supabase
      .from("puzzles")
      .select(`
        id, slug, type, title, published, explanation_correct, explanation_incorrect,
        puzzle_base_points(step, value),
        puzzle_answers(id, label, value, is_correct),
        puzzle_scenarios(
          id, label, is_correct,
          puzzle_scenario_points(step, value)
        )
      `)
      .order("id");

    if (!showAll) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

    const { slug, type, title, published, explanation_correct, explanation_incorrect, base_points, answers, scenarios } = req.body;
    const supabase = getSupabase();

    const { data: puzzle, error: puzzleError } = await supabase
      .from("puzzles")
      .insert({ slug, type, title, published, explanation_correct, explanation_incorrect })
      .select()
      .single();

    if (puzzleError) return res.status(500).json({ error: puzzleError.message });

    await supabase.from("puzzle_base_points").insert(
      base_points.map((p: { step: number; value: number }) => ({ puzzle_id: puzzle.id, ...p }))
    );

    if (type === "next_point") {
      await supabase.from("puzzle_answers").insert(
        answers.map((a: { label: string; value: number; is_correct: boolean }) => ({ puzzle_id: puzzle.id, ...a }))
      );
    } else if (type === "scenarios") {
      for (const scenario of scenarios) {
        const { data: s } = await supabase
          .from("puzzle_scenarios")
          .insert({ puzzle_id: puzzle.id, label: scenario.label, is_correct: scenario.is_correct })
          .select()
          .single();

        if (s) {
          await supabase.from("puzzle_scenario_points").insert(
            scenario.points.map((p: { step: number; value: number }) => ({ scenario_id: s.id, ...p }))
          );
        }
      }
    }

    return res.status(201).json({ id: puzzle.id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
