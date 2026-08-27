"use client";

import { useEffect, useState } from "react";
import type { CampaignWithStats, Contact, Template } from "@/lib/types";

interface Preview {
  contact_id: number;
  to: string;
  name: string;
  subject: string;
  body: string;
}

export default function CampaignsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [selected, setSelected] = useState<number[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  async function loadAll() {
    const [t, c, camp] = await Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
    ]);
    setTemplates(t);
    setContacts(c);
    setCampaigns(camp);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function refreshPreview() {
    setError(null);
    if (!templateId || selected.length === 0) {
      setPreviews([]);
      return;
    }
    const res = await fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId, contact_ids: selected }),
    });
    const data = await res.json();
    setPreviews(data.previews ?? []);
  }

  useEffect(() => {
    refreshPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, selected]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSentMsg(null);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, template_id: templateId, contact_ids: selected }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not send campaign");
      return;
    }
    setSentMsg(`Campaign "${name}" sent to ${selected.length} recipient(s).`);
    setName("");
    setTemplateId("");
    setSelected([]);
    setPreviews([]);
    loadAll();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
        <p className="mt-1 text-slate-500">
          Pick a template and audience, preview, then send.
        </p>
      </header>

      <form onSubmit={send} className="mb-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Campaign name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q3 outreach"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Template *</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Audience ({selected.length} selected)
            </span>
            <button
              type="button"
              onClick={() =>
                setSelected(
                  selected.length === contacts.length ? [] : contacts.map((c) => c.id)
                )
              }
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              {selected.length === contacts.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {contacts.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selected.includes(c.id)
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span>
                  <span className="font-medium text-slate-900">
                    {c.first_name} {c.last_name}
                  </span>{" "}
                  <span className="text-slate-500">· {c.company || c.email}</span>
                </span>
              </label>
            ))}
            {contacts.length === 0 && (
              <p className="text-sm text-slate-500">Add contacts first.</p>
            )}
          </div>
        </div>

        {previews.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-slate-600">
              Personalized preview
            </p>
            <div className="space-y-3">
              {previews.map((p) => (
                <div key={p.contact_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    To: <span className="font-medium text-slate-700">{p.name} &lt;{p.to}&gt;</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{p.subject}</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-700">
                    {p.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {sentMsg && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {sentMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={!name || !templateId || selected.length === 0}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send campaign
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">All campaigns</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium">Template</th>
                <th className="px-5 py-3 font-medium">Recipients</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3 text-slate-600">{c.template_name}</td>
                  <td className="px-5 py-3 text-slate-600">{c.sent_count}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
