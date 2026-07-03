# AGENTS.md — video-server

## Framework: Solon, NOT Spring Boot

- `@SolonMain` on `src/main/java/com/afo/video/App.java` — boot with `Solon.start(App.class, args)`
- `@Managed` ~= Spring `@Service`/`@Component`; `@Inject` for DI; `@Bean(index = ...)` for factory methods
- Controller mapping uses `@Mapping` (not `@GetMapping`/`@PostMapping`)

## Response format bifurcation

Two incompatible response wrappers coexist:
- `AjaxJson` — used in `AuthController` and `SaTokenConfigure`, codes: 200/500/401
- `AjaxResult` — used in all other controllers, codes: 200/500

Do NOT mix them or introduce a third.

## MyBatis-Flex APT codegen (required before IDE compile)

TableDef classes (`VideoTableDef`, `UserTableDef`, etc.) are generated at compile time by the `@Table` annotation processor and are **gitignored**. You must run `mvn compile` once before the IDE can resolve imports like `com.afo.video.domain.table.VideoTableDef.VIDEO`.

## Build & run

```bash
# Backend (Maven — no wrapper, needs system Maven)
mvn clean compile          # generates TableDef classes + compiles
mvn clean compile package  # produces target/video-server.jar

# Frontend (pnpm — run from frontend/)
pnpm install
pnpm dev                   # http://localhost:5173, proxies /api/* → localhost:8080
pnpm build                 # outputs to frontend/dist/
```

### Windows / Trae terminal

On Windows, you may need to set `$env:JAVA_HOME` before Maven commands:

```powershell
$env:JAVA_HOME='C:\Users\Administrator\jdk\jdk-17.0.12'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
```

## Frontend dev

```bash
cd frontend
pnpm lint          # ESLint
pnpm lint:fix      # ESLint auto-fix
pnpm format        # Prettier (auto-fix)
pnpm format:check  # Prettier (check only)
npx vue-tsc --noEmit  # TypeScript type-check (no test script exists)
```

## Auth (Sa-Token) — partial coverage

- `/video/**` and `/auth/**` are **excluded** from login checks (`SaTokenConfigure.java:25`)
- Token sent as `Bearer {token}` in `Authorization` header AND as `satoken` header
- Frontend interceptor: `frontend/src/utils/request.ts:77-83`

## Snowflake IDs

Backend uses distributed Snowflake IDs (`snowflake-id-solon-cloud-plugin`). On the frontend, these large integers must be parsed with `json-bigint` to avoid precision loss.

## No tests, no CI

Zero test files in the repo. No CI/CD configured. The frontend has husky/lint-staged in devDependencies but no `.husky/` directory (pre-commit hooks are inactive).

## Static files

`app.yml` maps `/static/uploads/` → `./static/uploads/` on disk. Avatar uploads land in `static/uploads/avatar/` (tracked in git).
