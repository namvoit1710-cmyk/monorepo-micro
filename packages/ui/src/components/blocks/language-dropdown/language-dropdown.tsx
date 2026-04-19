import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface ILanguageDropdown {
    lang: string;
    onChangeLang: (lang: string) => void;
    languages: string[];
}

const LanguageDropdown = ({
    lang,
    onChangeLang,
    languages,
    renderItem }:
    ILanguageDropdown & {
        renderItem?: (language: string) => React.ReactNode
    }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <span>Language</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {languages.map((language) => (
                    <div
                        key={language}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => onChangeLang(language)}
                    >
                        {renderItem ? renderItem(language) : language}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default LanguageDropdown