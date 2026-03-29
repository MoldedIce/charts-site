import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../lib/supabase";

type Comment = {
  id: number;
  idea_id: number;
  content: string;
  created_at: string;
};

type Idea = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  comments?: Comment[];
};

const CATEGORIES = ["Design", "Functionality", "Content", "Bug", "Other"];
const STATUSES = ["Idea", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];

const statusColors: Record<string, string> = {
  "Idea": "#667085",
  "In Progress": "#b45309",
  "Done": "#16a34a",
};

const priorityColors: Record<string, string> = {
  "Low": "#667085",
  "Medium": "#b45309",
  "High": "#dc2626",
};

const emptyForm = {
  title: "",
  description: "",
  category: "Functionality",
  status: "Idea",
  priority: "Medium",
};

export function IdeasTab() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  async function fetchIdeas() {
    setLoading(true);
    const { data: ideasData } = await supabaseAdmin
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: commentsData } = await supabaseAdmin
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (ideasData) {
      const withComments = ideasData.map((idea) => ({
        ...idea,
        comments: commentsData?.filter((c) => c.idea_id === idea.id) ?? [],
      }));
      setIdeas(withComments);
    }
    setLoading(false);
  }

  useEffect(() => { fetchIdeas(); }, []);

  async function handleAddIdea(e: React.FormEvent) {
    e.preventDefault();
    await supabaseAdmin.from("ideas").insert([form]);
    setForm(emptyForm);
    setShowForm(false);
    fetchIdeas();
  }

  async function handleDeleteIdea(id: number) {
    await supabaseAdmin.from("ideas").delete().eq("id", id);
    setExpandedId(null);
    fetchIdeas();
  }

  async function handleAddComment(ideaId: number) {
    if (!newComment.trim()) return;
    await supabaseAdmin.from("comments").insert([{ idea_id: ideaId, content: newComment.trim() }]);
    setNewComment("");
    fetchIdeas();
  }

  async function handleDeleteComment(commentId: number) {
    await supabaseAdmin.from("comments").delete().eq("id", commentId);
    fetchIdeas();
  }

  async function handleSaveEdit(id: number) {
    await supabaseAdmin.from("ideas").update(editForm).eq("id", id);
    setEditingId(null);
    fetchIdeas();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#101828" }}>Ideas</div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            background: "#101828",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {showForm ? "Cancel" : "+ New idea"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddIdea}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={selectStyle}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={selectStyle}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={selectStyle}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" style={submitButtonStyle}>Add idea</button>
        </form>
      )}

      {loading ? (
        <div style={{ color: "#667085", fontSize: 14 }}>Loading...</div>
      ) : ideas.length === 0 ? (
        <div style={{ color: "#667085", fontSize: 14 }}>No ideas yet. Add your first one!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ideas.map((idea) => {
            const isExpanded = expandedId === idea.id;
            const isEditing = editingId === idea.id;

            return (
              <div
                key={idea.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      style={inputStyle}
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={selectStyle}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={selectStyle}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} style={selectStyle}>
                        {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => handleSaveEdit(idea.id)} style={submitButtonStyle}>Save</button>
                      <button onClick={() => setEditingId(null)} style={cancelButtonStyle}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div
                        style={{ fontWeight: 600, fontSize: 15, color: "#101828", cursor: "pointer", flex: 1 }}
                        onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                      >
                        {idea.title}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => { setEditingId(idea.id); setEditForm({ title: idea.title, description: idea.description, category: idea.category, status: idea.status, priority: idea.priority }); }} style={smallButtonStyle}>Edit</button>
                        <button onClick={() => handleDeleteIdea(idea.id)} style={{ ...smallButtonStyle, color: "#dc2626" }}>Delete</button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <Badge text={idea.category} color="#667085" />
                      <Badge text={idea.status} color={statusColors[idea.status]} />
                      <Badge text={idea.priority} color={priorityColors[idea.priority]} />
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 14 }}>
                        {idea.description && (
                          <div style={{ fontSize: 14, color: "#475467", lineHeight: 1.6, marginBottom: 16 }}>
                            {idea.description}
                          </div>
                        )}

                        <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Comments {idea.comments?.length ? `(${idea.comments.length})` : ""}
                        </div>

                        {idea.comments?.map((comment) => (
                          <div key={comment.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid #eaecf0" }}>
                            <div style={{ fontSize: 14, color: "#101828", lineHeight: 1.5 }}>{comment.content}</div>
                            <button onClick={() => handleDeleteComment(comment.id)} style={{ ...smallButtonStyle, color: "#dc2626", flexShrink: 0, marginLeft: 12 }}>×</button>
                          </div>
                        ))}

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <input
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(idea.id); }}
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button onClick={() => handleAddComment(idea.id)} style={submitButtonStyle}>Add</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 500,
      color,
      background: `${color}15`,
      padding: "2px 8px",
      borderRadius: 6,
    }}>
      {text}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 14,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 14,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  border: "none",
  background: "#101828",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#101828",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const smallButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 13,
  color: "#667085",
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "2px 4px",
};
