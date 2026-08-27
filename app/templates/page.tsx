"use client";

import { useEffect, useState } from "react";
import type { Template } from "@/lib/types";

const VARIABLES = ["firstName", "lastName", "fullName", "company", "title", "email"];
const empty = { name: "", subject: "", body: "" };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/templates");
    setTemplates(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setForm({ ...empty });
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Templates</h1>
        <p className="mt-1 text-slate-500">
          Reusable emails with personalization variables.
        </p>
      </header>

      <form
        onSubmit={addTemplate}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Template name *</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Subject *</span>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Body *</span>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Insert variable:</span>
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm((f) => ({ ...f, body: `${f.body}{{${v}}}` }))}
              className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 hover:bg-slate-200"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Save template
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{t.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">Subject:</span> {t.subject}
                  </p>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                {t.body}
              </pre>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-slate-500">No templates yet — create one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
