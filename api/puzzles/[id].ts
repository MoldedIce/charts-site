import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase, isAuthorized } from "../_lib";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  const supabase = getSupabase();

  if (req.method === "PATCH") {
    const { error } = await supabase.from("puzzles").update(req.body).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === "PUT") {
    const { slug, type, title, published, explanation_correct, explanation_incorrect, base_points, answers, scenarios } = req.body;

    const { error: puzzleError } = await supabase
      .from("puzzles")
      .update({ slug, type, title, published, notes: req.body.notes ?? null, explanation_correct, explanation_incorrect })
      .eq("id", id);

    if (puzzleError) return res.status(500).json({ error: puzzleError.message });

    await supabase.from("puzzle_base_points").delete().eq("puzzle_id", id);
    await supabase.from("puzzle_base_points").insert(
      base_points.map((p: { step: number; value: number }) => ({ puzzle_id: Number(id), ...p }))
    );

    if (type === "next_point") {
      await supabase.from("puzzle_answers").delete().eq("puzzle_id", id);
      await supabase.from("puzzle_answers").insert(
        answers.map((a: { label: string; value: number; is_correct: boolean }) => ({ puzzle_id: Number(id), ...a }))
      );
    } else if (type === "scenarios") {
      await supabase.from("puzzle_scenarios").delete().eq("puzzle_id", id);
      for (const scenario of scenarios) {
        const { data: s } = await supabase
          .from("puzzle_scenarios")
          .insert({ puzzle_id: Number(id), label: scenario.label, is_correct: scenario.is_correct })
          .select()
          .single();

        if (s) {
          await supabase.from("puzzle_scenario_points").insert(
            scenario.points.map((p: { step: number; value: number }) => ({ scenario_id: s.id, ...p }))
          );
        }
      }
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const { error } = await supabase.from("puzzles").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
