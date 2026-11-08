/** Simple long-form text styling for About, Privacy and Terms. */
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page mt-12">
      <div className="max-w-[68ch] space-y-5 text-lg leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
