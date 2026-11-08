"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { deleteCategory, deleteTag, saveCategory, saveTag } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { slugify } from "@/lib/utils";
import { categoryFormSchema, tagFormSchema } from "@/lib/validations/taxonomy";
import type { TagType } from "@/types";
import ConfirmDialog from "./ConfirmDialog";
import { describedBy, Field } from "./fields";
import ImageUpload from "./ImageUpload";

/** One editable list for categories, or for one tag type (occasion, recipient, budget). */

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  imagePath?: string | null;
  usage: number;
};

type Kind = { kind: "category" } | { kind: "tag"; tagType: TagType };

type FormValues = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string | number;
  isActive: boolean;
  imagePath: string;
  tagType: TagType;
};

const NOUN: Record<string, string> = { category: "category", occasion: "occasion", recipient: "recipient", budget: "budget range" };

function ItemDialog({
  open,
  onOpenChange,
  item,
  target,
  nextSortOrder,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: TaxonomyItem | null;
  target: Kind;
  nextSortOrder: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const noun = NOUN[target.kind === "category" ? "category" : target.tagType];
  const schema = target.kind === "category" ? categoryFormSchema : tagFormSchema;
  const [slugTouched, setSlugTouched] = useState(Boolean(item));

  const { register, handleSubmit, control, setError, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    // The two schemas share field names; tagType/imagePath are ignored where they don't apply.
    resolver: zodResolver(schema as never),
  });

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setSlugTouched(Boolean(item));
    reset({
      name: item?.name ?? "",
      slug: item?.slug ?? "",
      description: item?.description ?? "",
      sortOrder: item?.sortOrder ?? nextSortOrder,
      isActive: item?.isActive ?? true,
      imagePath: item?.imagePath ?? "",
      tagType: target.kind === "tag" ? target.tagType : "occasion",
    });
  }, [open, item, nextSortOrder, reset, target]);

  const name = watch("name");
  useEffect(() => {
    if (open && !slugTouched) setValue("slug", slugify(name ?? ""));
  }, [name, slugTouched, open, setValue]);

  const err = (k: keyof FormValues) => errors[k]?.message as string | undefined;

  const submit = () =>
    startTransition(async () => {
      const values = watch();
      const res =
        target.kind === "category"
          ? await saveCategory(item?.id ?? null, {
              name: values.name,
              slug: values.slug,
              description: values.description,
              imagePath: values.imagePath,
              sortOrder: values.sortOrder,
              isActive: values.isActive,
            })
          : await saveTag(item?.id ?? null, {
              name: values.name,
              slug: values.slug,
              description: values.description,
              sortOrder: values.sortOrder,
              isActive: values.isActive,
              tagType: target.tagType,
            });
      if (!res.ok) {
        setMessage(res.message);
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as Path<FormValues>, { message: m });
        return;
      }
      onOpenChange(false);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" closeLabel="Close">
        <DialogTitle className="font-display text-2xl">{item ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
        <DialogDescription className="mt-1 text-plum-soft">Changes appear on the website as soon as you save.</DialogDescription>
        <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 space-y-5">
          <Field id="tx-name" label="Name" error={err("name")}>
            <input id="tx-name" className="field" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field id="tx-slug" label="URL slug" hint="Changing it breaks old links." error={err("slug")}>
            <input
              id="tx-slug"
              className="field font-mono text-sm"
              aria-invalid={!!errors.slug}
              aria-describedby={describedBy("tx-slug", "hint", err("slug"))}
              {...register("slug", { onChange: () => setSlugTouched(true) })}
            />
          </Field>
          <Field
            id="tx-desc"
            label={target.kind === "tag" && target.tagType === "budget" ? "Price range" : "Description"}
            hint={target.kind === "tag" && target.tagType === "budget" ? "Shown to visitors, e.g. “Under ৳3,000”." : undefined}
            optional
            error={err("description")}
          >
            <textarea id="tx-desc" rows={2} className="field" {...register("description")} />
          </Field>
          {target.kind === "category" && (
            <Controller
              control={control}
              name="imagePath"
              render={({ field }) => (
                <ImageUpload folder="categories" label="Card image" value={field.value || null} onChange={(p) => field.onChange(p ?? "")} />
              )}
            />
          )}
          <Field id="tx-order" label="Display order" hint="Lower numbers appear first." error={err("sortOrder")}>
            <input id="tx-order" type="number" min={0} className="field max-w-32" {...register("sortOrder")} />
          </Field>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 size-4 accent-[var(--color-plum)]" {...register("isActive")} />
            <span>
              <span className="block font-semibold">Show on the website</span>
              <span className="block text-sm text-plum-soft">Hidden items stay attached to gifts but don&apos;t appear in browsing.</span>
            </span>
          </label>
          {message && (
            <p role="alert" className="rounded-lg bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
              {message}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : item ? "Save changes" : `Add ${noun}`}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TaxonomyManager({ title, items, target }: { title: string; items: TaxonomyItem[]; target: Kind }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [open, setOpen] = useState(false);
  const noun = NOUN[target.kind === "category" ? "category" : target.tagType];
  const nextSortOrder = items.reduce((m, i) => Math.max(m, i.sortOrder + 1), 0);

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-plum-line">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus aria-hidden="true" /> Add {noun}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-plum-soft">Nothing here yet. Add the first {noun}.</p>
      ) : (
        <ul className="mt-4 divide-y divide-plum-line">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {i.name}{" "}
                  {!i.isActive && <span className="ml-1 rounded-full bg-plum/8 px-2 py-0.5 text-xs font-semibold text-plum-soft">Hidden</span>}
                </p>
                <p className="text-sm text-plum-soft">
                  /{i.slug}, used by {i.usage} {i.usage === 1 ? "gift" : "gifts"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(i);
                  setOpen(true);
                }}
              >
                <Pencil aria-hidden="true" /> Edit<span className="sr-only"> {i.name}</span>
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="text-danger">
                    <Trash2 aria-hidden="true" /> Delete<span className="sr-only"> {i.name}</span>
                  </Button>
                }
                title={`Delete “${i.name}”?`}
                description={
                  i.usage > 0
                    ? `It's attached to ${i.usage} ${i.usage === 1 ? "gift" : "gifts"}. They'll stay published but won't be listed under this ${noun}. To keep it but hide it, edit it and turn off “Show on the website”.`
                    : `This ${noun} isn't used by any gifts.`
                }
                confirmLabel={`Delete ${noun}`}
                onConfirm={() => (target.kind === "category" ? deleteCategory(i.id) : deleteTag(i.id))}
                onDone={() => router.refresh()}
              />
            </li>
          ))}
        </ul>
      )}
      <ItemDialog open={open} onOpenChange={setOpen} item={editing} target={target} nextSortOrder={nextSortOrder} />
    </section>
  );
}
