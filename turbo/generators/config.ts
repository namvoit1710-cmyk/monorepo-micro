import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // ─── Existing: scaffold a library package under packages/ ───────────────────
  plop.setGenerator("init", {
    description: "Generate a new package for the Ldc Autoform",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the package? (You can skip the `@ldc/` prefix)",
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@ldc/")) {
            answers.name = answers.name.replace("@ldc/", "");
          }
        }
        return "Config sanitized";
      },
      {
        type: "add",
        path: "packages/{{ name }}/eslint.config.ts",
        templateFile: "templates/eslint.config.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
      },
      {
        type: "modify",
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              const version = await fetch(
                `https://registry.npmjs.org/-/package/${dep}/dist-tags`,
              )
                .then((res) => res.json())
                .then((json) => json.latest);
              if (!pkg.dependencies) pkg.dependencies = {};
              pkg.dependencies[dep] = `^${version}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          // execSync("pnpm dlx sherif@latest --fix", {
          //   stdio: "inherit",
          // });
          execSync("pnpm i", { stdio: "inherit" });
          execSync(
            `pnpm prettier --write packages/${answers.name}/** --list-different`,
          );
          return "Package scaffolded";
        }
        return "Package not scaffolded";
      },
    ],
  });

  // ─── New: scaffold a React app under apps/ ───────────────────────────────────
  plop.setGenerator("app", {
    description:
      "Generate a new React app (Rsbuild + Module Federation + Tailwind) under apps/",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the app? (You can skip the `@ldc/` prefix)",
      },
      {
        type: "input",
        name: "port",
        message: "Which port should the dev server run on?",
        default: "3000",
      },
    ],
    actions: [
      // Sanitize name prefix
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@ldc/")) {
            answers.name = answers.name.replace("@ldc/", "");
          }
        }
        return "Config sanitized";
      },

      // Root config files
      {
        type: "add",
        path: "apps/{{ name }}/package.json",
        templateFile: "templates/app-package.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/tsconfig.json",
        templateFile: "templates/app-tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/rsbuild.config.ts",
        templateFile: "templates/app-rsbuild.config.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/eslint.config.ts",
        templateFile: "templates/eslint.config.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/index.html",
        templateFile: "templates/app-index.html.hbs",
      },

      // Source files
      {
        type: "add",
        path: "apps/{{ name }}/src/main.tsx",
        templateFile: "templates/app-main.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/bootstrap.tsx",
        templateFile: "templates/app-bootstrap.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/app.tsx",
        templateFile: "templates/app-app.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/index.css",
        templateFile: "templates/app-index.css.hbs",
      },

      // Layouts & pages
      {
        type: "add",
        path: "apps/{{ name }}/src/layouts/root-layout.tsx",
        templateFile: "templates/app-root-layout.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/pages/home.tsx",
        templateFile: "templates/app-home.tsx.hbs",
      },

      // Install & format
      async (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm i", { stdio: "inherit" });
          execSync(
            `pnpm prettier --write apps/${answers.name}/** --list-different`,
          );
          return `App "${answers.name}" scaffolded at apps/${answers.name}`;
        }
        return "App not scaffolded";
      },
    ],
  });
}
