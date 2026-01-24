import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/listings/${id}`);
        const l = res.data.data;

        if (!ignore) {
          setForm({
            title: l.title || "",
            description: l.description || "",
            price: l.price ?? "",
            category: l.category || "",
            location: l.location || "",
            country: l.country || "",
            imageUrl: l?.image?.url || "",
          });
        }
      } catch (e2) {
        if (!ignore) setError(e2?.response?.data?.message || "Failed to load listing");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [id]);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        location: form.location,
        country: form.country,
        image: form.imageUrl ? { url: form.imageUrl, filename: "external" } : undefined,
      };

      await api.put(`/listings/${id}`, payload);
      navigate(`/listing/${id}`);
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!form) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Edit Listing</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
        <input name="location" placeholder="Location" value={form.location} onChange={onChange} />
        <input name="country" placeholder="Country" value={form.country} onChange={onChange} />

        <input
          name="price"
          placeholder="Price per night"
          type="number"
          value={form.price}
          onChange={onChange}
          required
        />

        <input
          name="imageUrl"
          placeholder="Image URL (temporary)"
          value={form.imageUrl}
          onChange={onChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
          rows={5}
          required
        />

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button disabled={saving} type="submit">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
