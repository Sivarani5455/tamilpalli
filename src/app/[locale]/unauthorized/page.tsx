import { getLocaleOrThrow } from "@/lib/i18n";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const copy =
    locale === "ta"
      ? {
          title: "அணுகல் இல்லை",
          description: "இந்த பாதை உள்நுழைந்த பயனர்கள் அல்லது தேவையான திட்டம் கொண்டவர்களுக்கு மட்டும் ஒதுக்கப்பட்டுள்ளது.",
        }
      : locale === "fr"
        ? {
            title: "Accès refusé",
            description: "Cette page est réservée aux utilisateurs connectés disposant du rôle ou de l'abonnement requis.",
          }
        : {
            title: "Unauthorized",
            description: "This route is reserved for authenticated users with the required role or subscription level.",
          };

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">{copy.title}</h1>
      <p className="mt-4 text-lg text-slate-600">
        {copy.description}
      </p>
    </div>
  );
}
