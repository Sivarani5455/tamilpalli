import {
  deleteDictionaryAction,
  deleteFillBlankAction,
  deleteImageHuntAction,
  deleteKathaigalAction,
  deleteThirukkuralAction,
  deleteWordHuntAction,
  deleteWordSearchAction,
} from "@/app/[locale]/admin/content-actions";
import type { Locale } from "@/types";

export function DeleteContentButton({
  locale,
  id,
  kind,
  className,
}: {
  locale: Locale;
  id: string;
  kind: "word-search" | "fill-in-the-blanks" | "image-hunt" | "word_hunt" | "kathaigal" | "thirukkural" | "dictionary";
  className?: string;
}) {
  const action =
    kind === "word-search"
      ? deleteWordSearchAction
      : kind === "fill-in-the-blanks"
        ? deleteFillBlankAction
        : kind === "image-hunt"
          ? deleteImageHuntAction
          : kind === "word_hunt"
            ? deleteWordHuntAction
            : kind === "kathaigal"
              ? deleteKathaigalAction
              : kind === "thirukkural"
                ? deleteThirukkuralAction
                : deleteDictionaryAction;

  return (
    <form action={action}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button className={className ?? "rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-600"}>
        Delete
      </button>
    </form>
  );
}
