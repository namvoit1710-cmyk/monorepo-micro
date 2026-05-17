import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useLanguage } from "./language-provider";

const Ctx = createContext<(msg: string, title?: string) => Promise<boolean>>(null!);

export function MessageBoxProvider({ children }: { children: React.ReactNode }) {

    const { t } = useLanguage();

    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<{ message: string; title?: string }>({ message: "" });
    const resolveRef = useRef<((action: boolean) => void) | null>(null);

    const showMessageBox = useCallback((message: string, title?: string): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({ message, title });
            setOpen(true);
        });
    }, []);

    const handleClose = useCallback((action: boolean) => {
        setOpen(false);
        resolveRef.current?.(action);
    }, []);

    return (
        <Ctx.Provider value={showMessageBox}>
            {children}

            <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(false); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {config.title && <AlertDialogTitle>{config.title}</AlertDialogTitle>}
                        <AlertDialogDescription>{config.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="py-1">
                        <AlertDialogCancel onClick={() => handleClose(false)}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClose(true)}>
                            {t("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Ctx.Provider>
    );
}

export const useMessageBox = () => useContext(Ctx);