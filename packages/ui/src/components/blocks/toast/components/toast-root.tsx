import { Toaster } from "sonner";

export function ToasterRoot() {
    return (
        <Toaster
            position="top-center"
            visibleToasts={3}
            offset={{
                top: 10
            }}
            toastOptions={{ unstyled: true }}
        />
    );
}