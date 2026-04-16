
import { useTranslation } from "@ldc/i18n";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full items-center justify-center overflow-hidden w-full">
      <h1>{t("greeting")}</h1>
      <p>{t("welcome")}</p>
    </div>
  );
};

export default HomePage;
