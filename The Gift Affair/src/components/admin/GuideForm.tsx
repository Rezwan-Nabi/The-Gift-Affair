"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { saveGuide } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { guideFormSchema, type GuideFormData, type GuideFormInput } from "@/lib/validations/taxonomy";
import type { ContentStatus, Guide } from "@/types";
import { describedBy, Field, FormSection } from "./fields";
import ImageUpload from "./ImageUpload";

type GiftOption = { id: string; title: string; status: ContentStatus };

export default function GuideForm({ guide, giftOptions }: { guide: Guide | null; giftOptions: GiftOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(guide));
  const [filter, setFilter] = useState("");

  const { register, control, handleSubmit, setError, setValue, watch, reset, formState: { errors } } = useForm<
    GuideFormInput,
    unknown,
    GuideFormData
  >({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      title: guide?.title ?? "",
      slug: guide?.slug ?? "",
      introduction: guide?.introduction ?? "",
      content: guide?.content ?? "",
      coverImagePath: guide?.coverImagePath ?? "",
      coverImageAlt: guide?.coverImageAlt ?? "",
      giftIds: guide?.gifts.map((g) => g.id) ?? [],
      status: guide?.status ?? "draft",
    },
  });

  const title = watch("title");
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(title ?? ""));
  }, [title, slugTouched, setValue]);

  const byId = useMemo(() => new Map(giftOptions.map((g) => [g.id, g])), [giftOptions]);
  const err = (k: string) => (errors as Record<string, { message?: string } | undefined>)[k]?.message;

  const onSubmit = () =>
    startTransition(async () => {
      setNotice(null);
      const res = await saveGuide(guide?.id ?? null, watch());
      if (!res.ok) {
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as Path<GuideFormInput>, { message: m });
        setNotice({ tone: "error", text: res.message });
        return;
      }
      reset(watch());
      if (!guide) router.replace(`/admin/guides/${res.data.id}/edit`);
      else {
        setNotice({ tone: "ok", text: "Guide saved." });
        router.refresh();
      }
    });

  return (
    <form onSubmit={handleSubmit(onSubmit, () => setNotice({ tone: "error", text: "Some details need fixing." }))} noValidate className="space-y-6">
      <FormSection title="Guide">
        <Field id="g-title" label="Title" error={err("title")}>
          <input id="g-title" className="field" aria-invalid={!!errors.title} {...register("title")} />
        </Field>
        <Field id="g-slug" label="URL slug" hint="/gift-guides/your-slug" error={err("slug")}>
          <input id="g-slug" className="field font-mono text-sm" aria-describedby={describedBy("g-slug", "hint", err("slug"))} {...register("slug", { onChange: () => setSlugTouched(true) })} />
        </Field>
        <Field id="g-intro" label="Introduction" hint="Shown on guide cards and at the top of the guide." error={err("introduction")}>
          <textarea id="g-intro" rows={3} className="field" aria-describedby={describedBy("g-intro", "hint", err("introduction"))} {...register("introduction")} />
        </Field>
        <Field id="g-content" label="Article" optional hint="Plain text. Separate paragraphs with a blank line." error={err("content")}>
          <textarea id="g-content" rows={8} className="field" {...register("content")} />
        </Field>
        <Controller
          control={control}
          name="coverImagePath"
          render={({ field }) => <ImageUpload folder="guides" label="Cover image" value={field.value || null} onChange={(p) => field.onChange(p ?? "")} />}
        />
        <Field id="g-alt" label="Cover image description (alt text)" error={err("coverImageAlt")}>
          <input id="g-alt" className="field" {...register("coverImageAlt")} />
        </Field>
      </FormSection>

      <FormSection title="Gifts in this guide" description="Pick gifts and put them in the order you want them shown. Only published gifts appear on the site.">
        <Controller
          control={control}
          name="giftIds"
          render={({ field }) => {
            const selected: string[] = field.value ?? [];
            const move = (i: number, d: -1 | 1) => {
              const next = [...selected];
              [next[i], next[i + d]] = [next[i + d], next[i]];
              field.onChange(next);
            };
            const available = giftOptions.filter(
              (g) => !selected.includes(g.id) && g.title.toLowerCase().includes(filter.trim().toLowerCase()),
            );
            return (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 font-semibold">Selected ({selected.length})</p>
                  {selected.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-plum/25 p-4 text-sm text-plum-soft">No gifts yet. Add some from the list.</p>
                  ) : (
                    <ol className="space-y-2">
                      {selected.map((id, i) => (
                        <li key={id} className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2">
                          <span className="w-6 text-sm text-plum-soft">{i + 1}.</span>
                          <span className="flex-1 text-sm font-medium">
                            {byId.get(id)?.title ?? "Unavailable gift"}
                            {byId.get(id)?.status === "draft" && <span className="ml-2 text-xs text-plum-soft">(draft)</span>}
                          </span>
                          <Button variant="ghost" size="icon" className="size-9" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${byId.get(id)?.title} up`}>
                            <ArrowUp aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-9" disabled={i === selected.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${byId.get(id)?.title} down`}>
                            <ArrowDown aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-9" onClick={() => field.onChange(selected.filter((x) => x !== id))} aria-label={`Remove ${byId.get(id)?.title}`}>
                            <X aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <div>
                  <label htmlFor="g-find" className="mb-2 block font-semibold">
                    Add gifts
                  </label>
                  <input id="g-find" type="search" placeholder="Filter by title" className="field" value={filter} onChange={(e) => setFilter(e.target.value)} />
                  <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto">
                    {available.map((g) => (
                      <li key={g.id}>
                        <button type="button" onClick={() => field.onChange([...selected, g.id])} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-cream">
                          <span>{g.title}</span>
                          <span className="font-semibold">Add</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }}
        />
      </FormSection>

      <FormSection title="Publishing">
        <Field id="g-status" label="Status">
          <select id="g-status" className="field field-select max-w-xs" {...register("status")}>
            <option value="draft">Draft (only editors can see it)</option>
            <option value="published">Published (visible on the website)</option>
            <option value="archived">Archived (hidden)</option>
          </select>
        </Field>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-plum-line bg-cream/95 px-4 py-4 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : guide ? "Save changes" : "Create guide"}
        </Button>
        <div role="status" aria-live="polite" className="text-sm font-medium">
          {notice && <span className={notice.tone === "ok" ? "text-success" : "text-danger"}>{notice.text}</span>}
        </div>
      </div>
    </form>
  );
}
