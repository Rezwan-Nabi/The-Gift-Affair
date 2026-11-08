import type { Gift } from "@/types";
import GiftCard from "./GiftCard";

export default function GiftGrid({ gifts, priorityCount = 0 }: { gifts: Gift[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {gifts.map((gift, i) => (
        <li key={gift.id}>
          <GiftCard gift={gift} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
