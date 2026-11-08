"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, type Path } from "react-hook-form";
import { saveGift } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { giftFormSchema, type GiftFormData, type GiftFormInput } from "@/lib/validations/gift";
import type { Category, Gift, Tag } from "@/types";
import { CheckboxGroup, describedBy, Field, FormSection } from "./fields";
import ImageUpload from "./ImageUpload";

type Props = {
  gift: Gift | null;
  /** Shown once after creating, e.g. "Gift created." */
  initialNotice?: string;
  categories: Category[];
  tags: Tag[];
};

function defaults(g: Gift | null): GiftFormInput {
  const tagIds = (type: Tag["tagType"]) => (g?.tags ?? []).filter((t) => t.tagType === type).map((t) => t.id);
  return {
    title: g?.title ?? "",
    slug: g?.slug ?? "",
    summary: g?.summary ?? "",
    description: g?.description ?? "",
    whyThoughtful: g?.whyThoughtful ?? "",
    keywords: g?.keywords ?? "",
    mainImagePath: g?.mainImagePath ?? "",
    imageAlt: g?.imageAlt ?? "",
    gallery: (g?.images ?? []).map((i) => ({ path: i.path, alt: i.alt })),
    categoryIds: (g?.categories ?? []).map((c) => c.id),
    occasionIds: tagIds("occasion"),
    recipientIds: tagIds("recipient"),
    budgetId: tagIds("budget")[0] ?? "",
    priceAmount: g?.priceAmount != null ? String(g.priceAmount) : "",
    currency: g?.currency ?? "BDT",
    priceCheckedAt: g?.priceCheckedAt ?? "",
    externalUrl: g?.externalUrl ?? "",
    sourceName: g?.sourceName ?? "",
    isFeatured: g?.isFeatured ?? false,
    status: g?.status ?? "draft",
  };
}

export default function GiftForm({ gift, categories, tags, initialNotice }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(
    initialNotice ? { tone: "ok", text: initialNotice } : null,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(gift));

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<GiftFormInput, unknown, GiftFormData>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: defaults(gift),
    mode: "onBlur",
  });
  const gallery = useFieldArray({ control, name: "gallery" });

  const title = watch("title");
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(title ?? ""), { shouldValidate: false });
  }, [title, slugTouched, setValue]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const byType = (type: Tag["tagType"]) =>
    tags.filter((t) => t.tagType === type).map((t) => ({ id: t.id, name: t.name, inactive: !t.isActive }));

  const err = (name: string) => (errors as Record<string, { message?: string } | undefined>)[name]?.message;

  const onSubmit = (_data: GiftFormData) => {
    setNotice(null);
    startTransition(async () => {
      // Send the raw form values: the server parses them again with the same schema.
      const res = await saveGift(gift?.id ?? null, watch());
      if (!res.ok) {
        for (const [name, message] of Object.entries(res.fieldErrors ?? {})) {
          setError(name as Path<GiftFormInput>, { message });
        }
        setNotice({ tone: "error", text: res.message });
        return;
      }
      reset(watch());
      if (!gift) {
        router.replace(`/admin/gifts/${res.data.id}/edit?saved=1`);
      } else {
        setNotice({ tone: "ok", text: "Changes saved." });
        router.refresh();
      }
    });
  };

  const onInvalid = () => setNotice({ tone: "error", text: "Some details need fixing. Check the highlighted fields." });

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
      <FormSection title="Basics" description="What visitors see on cards and at the top of the gift page.">
        <Field id="title" label="Title" error={err("title")}>
          <input id="title" className="field" aria-invalid={!!errors.title} aria-describedby={describedBy("title", undefined, err("title"))} {...register("title")} />
        </Field>
        <Field id="slug" label="URL slug" hint="The end of the page address: /gift-ideas/your-slug. Changing it breaks old links." error={err("slug")}>
          <input
            id="slug"
            className="field font-mono text-sm"
            aria-invalid={!!errors.slug}
            aria-describedby={describedBy("slug", "hint", err("slug"))}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
        </Field>
        <Field id="summary" label="Summary" hint="One or two sentences for gift cards. Up to 200 characters." error={err("summary")}>
          <textarea id="summary" rows={2} className="field" aria-invalid={!!errors.summary} aria-describedby={describedBy("summary", "hint", err("summary"))} {...register("summary")} />
        </Field>
        <Field id="description" label="Full description" hint="Separate paragraphs with a blank line." error={err("description")}>
          <textarea id="description" rows={7} className="field" aria-invalid={!!errors.description} aria-describedby={describedBy("description", "hint", err("description"))} {...register("description")} />
        </Field>
        <Field id="whyThoughtful" label="Why this makes a thoughtful gift" optional error={err("whyThoughtful")}>
          <textarea id="whyThoughtful" rows={3} className="field" {...register("whyThoughtful")} />
        </Field>
        <Field id="keywords" label="Search keywords" optional hint="Extra words people might search for, separated by commas." error={err("keywords")}>
          <input id="keywords" className="field" aria-describedby={describedBy("keywords", "hint", err("keywords"))} {...register("keywords")} />
        </Field>
      </FormSection>

      <FormSection title="Images" description="Use images you own, have licensed, or have permission to use.">
        <Controller
          control={control}
          name="mainImagePath"
          render={({ field }) => (
            <ImageUpload folder="gifts" label="Main image" value={field.value || null} onChange={(p) => field.onChange(p ?? "")} error={err("mainImagePath")} />
          )}
        />
        <Field id="imageAlt" label="Main image description (alt text)" hint="Describe what's in the photo, e.g. “Hand-painted ceramic mugs on a wooden table”." error={err("imageAlt")}>
          <input id="imageAlt" className="field" aria-invalid={!!errors.imageAlt} aria-describedby={describedBy("imageAlt", "hint", err("imageAlt"))} {...register("imageAlt")} />
        </Field>

        <fieldset>
          <legend className="font-semibold">Gallery</legend>
          <p className="mt-0.5 text-sm text-plum-soft">Up to 8 extra images, shown as thumbnails on the gift page.</p>
          <ul className="mt-4 space-y-5">
            {gallery.fields.map((f, i) => (
              <li key={f.id} className="rounded-xl border border-plum-line p-4">
                <Controller
                  control={control}
                  name={`gallery.${i}.path`}
                  render={({ field }) => (
                    <ImageUpload folder="gifts" label={`Gallery image ${i + 1}`} value={field.value || null} onChange={(p) => field.onChange(p ?? "")} />
                  )}
                />
                <Field id={`gallery-${i}-alt`} label="Description (alt text)" className="mt-4" error={errors.gallery?.[i]?.alt?.message}>
                  <input id={`gallery-${i}-alt`} className="field" {...register(`gallery.${i}.alt`)} />
                </Field>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => gallery.remove(i)}>
                  <Trash2 aria-hidden="true" /> Remove image {i + 1}
                </Button>
              </li>
            ))}
          </ul>
          {gallery.fields.length < 8 && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => gallery.append({ path: "", alt: "" })}>
              <Plus aria-hidden="true" /> Add gallery image
            </Button>
          )}
        </fieldset>
      </FormSection>

      <FormSection title="Browsing" description="Where this gift appears when visitors browse and filter.">
        <Controller control={control} name="categoryIds" render={({ field }) => (
          <CheckboxGroup legend="Categories" options={categories.map((c) => ({ id: c.id, name: c.name, inactive: !c.isActive }))} value={field.value} onChange={field.onChange} error={err("categoryIds")} />
        )} />
        <Controller control={control} name="occasionIds" render={({ field }) => (
          <CheckboxGroup legend="Occasions" options={byType("occasion")} value={field.value} onChange={field.onChange} />
        )} />
        <Controller control={control} name="recipientIds" render={({ field }) => (
          <CheckboxGroup legend="Recipients" options={byType("recipient")} value={field.value} onChange={field.onChange} />
        )} />
        <Field id="budgetId" label="Budget range" error={err("budgetId")}>
          <select id="budgetId" className="field field-select max-w-sm" {...register("budgetId")}>
            <option value="">No budget range</option>
            {byType("budget").map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Source and price" description="Optional. Only add a price you've checked; it's shown with the date you checked it.">
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="externalUrl" label="Retailer or maker link" optional error={err("externalUrl")}>
            <input id="externalUrl" type="url" inputMode="url" placeholder="https://" className="field" aria-invalid={!!errors.externalUrl} aria-describedby={describedBy("externalUrl", undefined, err("externalUrl"))} {...register("externalUrl")} />
          </Field>
          <Field id="sourceName" label="Shop or maker name" optional hint="Shown on the button, e.g. “View at Aarong”." error={err("sourceName")}>
            <input id="sourceName" className="field" {...register("sourceName")} />
          </Field>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Field id="priceAmount" label="Price" optional error={err("priceAmount")}>
            <input id="priceAmount" inputMode="decimal" className="field" aria-invalid={!!errors.priceAmount} {...register("priceAmount")} />
          </Field>
          <Field id="currency" label="Currency" hint="3-letter code" error={err("currency")}>
            <input id="currency" maxLength={3} className="field uppercase" aria-invalid={!!errors.currency} {...register("currency")} />
          </Field>
          <Field id="priceCheckedAt" label="Price checked on" error={err("priceCheckedAt")}>
            <input id="priceCheckedAt" type="date" className="field" aria-invalid={!!errors.priceCheckedAt} {...register("priceCheckedAt")} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Publishing">
        <fieldset>
          <legend className="mb-2 font-semibold">Status</legend>
          <div className="flex flex-wrap gap-3">
            {[
              { v: "draft", label: "Draft", hint: "Only editors can see it" },
              { v: "published", label: "Published", hint: "Visible on the website" },
              { v: "archived", label: "Archived", hint: "Hidden, kept for later" },
            ].map((o) => (
              <label key={o.v} className="flex min-w-44 cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-plum/20 bg-cream p-3 has-[:checked]:border-plum">
                <input type="radio" value={o.v} className="mt-1 size-4 accent-[var(--color-plum)]" {...register("status")} />
                <span>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-plum-soft">{o.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {err("status") && <p className="mt-1.5 text-sm font-medium text-danger">{err("status")}</p>}
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 size-4 accent-[var(--color-plum)]" {...register("isFeatured")} />
          <span>
            <span className="block font-semibold">Feature this gift</span>
            <span className="block text-sm text-plum-soft">Featured gifts appear first and on the homepage.</span>
          </span>
        </label>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-plum-line bg-cream/95 px-4 py-4 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : gift ? "Save changes" : "Create gift"}
        </Button>
        {gift && (
          <Link href={`/admin/gifts/${gift.id}/preview`} className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold underline underline-offset-4">
            Preview
          </Link>
        )}
        <div role="status" aria-live="polite" className="text-sm font-medium">
          {notice && <span className={notice.tone === "ok" ? "text-success" : "text-danger"}>{notice.text}</span>}
          {!notice && isDirty && <span className="text-plum-soft">Unsaved changes</span>}
        </div>
      </div>
    </form>
  );
}
