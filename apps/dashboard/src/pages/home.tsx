
import { useTranslation } from "@ldc/i18n";

const HomePage = () => {
    const { t } = useTranslation("dashboard")

    return (
        <div className="bg-muted w-full h-full flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-primary">{t("greeting")}</h1>
            <p className="text-lg text-muted-foreground">{t("welcome")}</p>
        </div>
    );
};

export default HomePage;
