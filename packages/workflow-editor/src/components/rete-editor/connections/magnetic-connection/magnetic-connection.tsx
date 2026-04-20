import type { ClassicScheme } from "rete-react-plugin";
import { Presets } from "rete-react-plugin";

const { useConnection } = Presets.classic;

export function MagneticConnection(props: {
    data: ClassicScheme["Connection"] & { isLoop?: boolean };
    styles?: () => any;
}) {
    const { path } = useConnection();

    if (!path) return null;

    return (
        <svg
            data-id="connection"
            className="!overflow-visible absolute pointer-events-none w-[9999px] h-[9999px]"
        >
            <path
                d={path}
                className="fill-none stroke-[2px] stroke-[#ffd92c] pointer-events-auto blur-[2px]"
                style={props.styles?.()}
            />
        </svg>
    );
}
