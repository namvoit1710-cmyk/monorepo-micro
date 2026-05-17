import { createI18nInstance } from "@common/i18n";
import { I18nextProvider, useTranslation } from "react-i18next";

const i18n = createI18nInstance();

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
};

export const useLanguage = () => {
    const t = useTranslation("ai-workflow");

    return t;
};

export default LanguageProvider;