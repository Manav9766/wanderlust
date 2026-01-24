import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CATEGORY_OPTIONS = [
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Amazing Pools",
  "Camping",
  "Farms",
  "Arctic",
  "Domes",
  "Boats",
];

export default function NewListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    country: "",
    location: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Step 6: AI loading state
  const [aiLoading, setAiLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      String(form.price).trim() &&
      form.country.trim() &&
      form.location.trim()
    );
  }, [form]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ✅ Step 6: Call AI endpoint and fill description
  async function generateDescriptionWithAI() {
    if (!isAuthenticated) {
      toast.error("Please log in to use AI.");
      navigate("/login");
      return;
    }

    // basic UX guardrails (avoid garbage prompts)
    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.country.trim() ||
      !form.category.trim()
    ) {
      toast.error("Fill Title, Category, Location, and Country first.");
      return;
    }

    try {
      setAiLoading(true);

      const res = await api.post("/ai/generate-description", {
        title: form.title,
        location: form.location,
        country: form.country,
        category: form.category,
        price: form.price ? Number(form.price) : undefined,
      });

      const aiText = res?.data?.description || "";
      if (!aiText.trim()) {
        toast.error("AI returned empty text. Try again.");
        return;
      }

      setForm((prev) => ({ ...prev, description: aiText }));
      toast.success("Description generated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to generate description"
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to create a listing.");
      navigate("/login");
      return;
    }

    if (!canSubmit) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("price", String(form.price));
      fd.append("country", form.country);
      fd.append("location", form.location);

      if (imageFile) fd.append("image", imageFile);

      const res = await api.post("/listings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Listing created");
      navigate(`/listing/${res.data?.data?._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="container"
      style={{ maxWidth: 900, paddingTop: 28, paddingBottom: 28 }}
    >
      <h2 className="mb-4">Create a New Listing</h2>

      <form onSubmit={onSubmit} className="bg-white p-4 border rounded-3">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            placeholder="Add a catchy title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          {/* ✅ Description label + AI button */}
          <div className="d-flex align-items-center justify-content-between">
            <label className="form-label mb-0">Description</label>

          
            <button
              type="button"
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
              onClick={generateDescriptionWithAI}
              disabled={aiLoading}
              title="Generate description using AI"
            >
              {aiLoading ? (
                "Generating..."
              ) : (
                <>
                  <i className="fa-brands fa-github"></i>
                  Generate with AI
                </>
              )}
            </button>
          </div>

          <textarea
            className="form-control mt-2"
            rows={4}
            placeholder="Describe your place..."
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            required
          />
          <div className="form-text">
            Tip: Fill Title/Category/Location/Country first, then click
            “Generate with AI”.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Listing Image</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <div className="form-text">
            Optional (but recommended). If skipped, a placeholder image will be
            used.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Choose Category</label>
          <select
            className="form-select"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Price</label>
            <input
              className="form-control"
              type="number"
              min="0"
              placeholder="2500"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Country</label>
            <input
              className="form-control"
              placeholder="Canada"
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Location</label>
          <input
            className="form-control"
            placeholder="Toronto, ON"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Add"}
        </button>
      </form>
    </div>
  );
}
