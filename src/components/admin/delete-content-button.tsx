import {
  deleteDictionaryAction,
  deleteFillBlankAction,
  deleteImageHuntAction,
  deleteWordSearchAction,
} from "@/app/[locale]/admin/content-actions";
import type { Locale } from "@/types";

export function DeleteContentButton({
  locale,
  id,
  kind,
}: {
  locale: Locale;
  id: string;
  kind: "word-search" | "fill-in-the-blanks" | "image-hunt" | "dictionary";
}) {
  const action =
    kind === "word-search"
      ? deleteWordSearchAction
      : kind === "fill-in-the-blanks"
        ? deleteFillBlankAction
        : kind === "image-hunt"
          ? deleteImageHuntAction
          : deleteDictionaryAction;

  return (
    <form action={action}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button className="rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-600">
        Delete
      </button>
    </form>
  );
}
