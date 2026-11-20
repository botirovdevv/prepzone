import { LuCalculator, LuArrowRight } from "react-icons/lu";
import { Page, PageHeader, Card, Button, IconTile, Badge } from "../components/ui";
import { useI18n } from "../i18n";

// Desmos bo'limi hali tayyor emas (kalkulyator ulanmagan) — sidebar'da
// "Tez orada" bilan o'chiq. To'g'ridan-to'g'ri manzil bilan kelganlarga
// shu ogohlantirish ko'rsatiladi. Admin darsliklarni qo'shishda davom etadi.
export default function DesmosIndex() {
  const { t } = useI18n();
  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("desmos.eyebrow")}
        icon={LuCalculator}
        title={t("desmos.title")}
        actions={<Badge tone="amber">{t("common.soon")}</Badge>}
      />
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <IconTile icon={LuCalculator} tone="amber" size="lg" />
        <p className="mt-4 font-display text-lg font-bold text-ink">{t("desmos.soonTitle")}</p>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink/55">{t("desmos.soonText")}</p>
        <Button to="/dashboard" variant="outline" className="mt-6">
          {t("desmos.back")} <LuArrowRight size={16} />
        </Button>
      </Card>
    </Page>
  );
}
