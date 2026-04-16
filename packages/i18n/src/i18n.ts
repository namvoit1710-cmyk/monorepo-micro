
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


import type { i18n as I18nInstance } from 'i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import jpCommon from './locales/jp/common.json';

import enDashboard from './locales/en/dashboard.json';
import jpDashboard from './locales/jp/dashboard.json';

export const initializeI18n = async (): Promise<I18nInstance> => {
    if (i18n.isInitialized) return i18n;

    await i18n.use(initReactI18next).init({
        lng: 'vi',
        ns: ["common", "dashboard"],
        fallbackLng: 'en',
        defaultNS: 'common',
        resources: {
            en: {
                common: enCommon,
                dashboard: enDashboard
            },
            jp: {
                common: jpCommon,
                dashboard: jpDashboard
            },
        },
        interpolation: { escapeValue: false },
    });

    return i18n;
}
