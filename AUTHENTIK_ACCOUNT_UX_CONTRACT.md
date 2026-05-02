# Westgate Account UX Contract

## Goal

Make Authentik effectively invisible to end users by making NodeBB the primary user-facing account surface for Westgate.

Users should feel like they are using the Westgate forum account system, not a separate Authentik identity provider.

## Current Architecture

```text
NodeBB -> Authentik SSO -> Gitea + future services
```

NodeBB remains the public-facing community hub. Authentik remains the identity provider and source of SSO for NodeBB, Gitea, and future services.

## Repository Boundary

This repository is a NodeBB theme, not a standalone auth plugin.

Use it for:

- Theme templates.
- Layout and copy changes.
- Styling and visual hierarchy.
- Replacing visible NodeBB auth/account surfaces with Westgate-branded UI.
- Pointing buttons and links at already-configured safe auth/account URLs.
- Small defensive client-side link normalization when server-rendered templates cannot cover plugin-emitted markup.

Do not use it for:

- Storing Authentik API tokens, OAuth client secrets, SMTP secrets, or service credentials.
- Implementing Authentik API clients.
- Implementing password, MFA, enrollment, or recovery backends.
- Creating long-lived auth/session state.
- Reimplementing Authentik recovery, TOTP, WebAuthn, passkey, or password flows.
- Owning account lifecycle behavior that belongs in Authentik, NodeBB core settings, an SSO plugin, or a dedicated NodeBB plugin.

If future work requires Authentik API calls, server-side POST handlers, service credentials, or new account-management routes that do more than render theme UI, that work should be split into a dedicated plugin or infrastructure configuration task. This theme can provide the UI surface that links to it.

## Desired UX

- A normal user starts at `forum.westgate.pw`.
- They can register, log in, reset their password, and reach Gitea without needing to understand that Authentik exists.
- Users should not need to intentionally visit Authentik directly for normal account actions.
- NodeBB should render the account pages, explanatory copy, buttons, and most navigation wherever possible.
- Authentik should appear only for identity-critical interaction steps that cannot safely be reproduced inside NodeBB.
- If Authentik screens must appear, they should be branded enough to feel like part of Westgate/NodeBB account infrastructure.

## Known Current State

- Authentik SSO works with NodeBB.
- Gitea is connected downstream.
- Email sending works through Zoho SMTP.
- SPF, DKIM, and DMARC pass.
- `noreply@westgate.pw` works.
- Password recovery flow works.
- Authentik default emails and UI are ugly and feel separate.
- NodeBB should remain the public-facing community hub.

## Primary Goals

1. Users should never need to intentionally visit Authentik directly for normal account actions.
2. NodeBB login, registration, and password recovery entry points should guide users into the correct Authentik flow.
3. Native NodeBB account creation and password recovery should not compete with Authentik-backed identity.
4. OAuth/SSO linking must continue to rely on stable Authentik UID/sub mapping.
5. If users briefly see Authentik, it should read as Westgate account infrastructure.
6. The theme must not become an authentication backend.

## Tasks

### 1. Audit Current NodeBB Auth UX

- Identify every place NodeBB shows login, registration, password reset, profile security, or account settings.
- Determine which pages, buttons, and links should be replaced, hidden, or redirected to Authentik flows.
- Preserve a seamless "Westgate account" mental model.
- Document the current templates, settings, routes, and plugin behavior before changing them.

### 2. Replace NodeBB Login And Registration Entry Points

- Modify the NodeBB theme, templates, or plugin settings so login buttons start from NodeBB and enter Authentik SSO only when authentication must happen.
- Replace native registration forms with a Westgate/NodeBB registration surface that uses Authentik-backed enrollment when enabled.
- Hide or replace native NodeBB password reset entry points with Westgate/NodeBB recovery surfaces.
- Avoid duplicate account creation.
- Confirm OAuth/SSO linking remains based on stable Authentik UID/sub mapping.

### 3. Integrate Password Reset Into NodeBB-Facing UX

- Add or replace NodeBB "Forgot password?" links with the Authentik recovery flow.
- Prefer a branded NodeBB page that handles the visible recovery UX and only calls or forwards to Authentik for the actual identity operation.
- Confirm the reset flow returns users to NodeBB after completion, not to the Authentik app dashboard.

### 4. Improve Authentik Branding Fallback

If users must see Authentik, configure it to feel like Westgate account infrastructure:

- Brand name: `Shadows Over Westgate` or `Westgate`.
- Logo/icon matching the forum theme.
- Dark plum/gothic palette where supported.
- Friendly recovery and login titles.
- Flow titles and prompts should not show generic "authentik" language where users see it.
- Recovery email subject should be similar to `Reset your Westgate account password`.
- From address must remain `noreply@westgate.pw`.

### 5. Redirect Behavior

- Normal login should start from NodeBB and return to NodeBB.
- Post-recovery and post-login flows should not strand users on Authentik "My Applications" unless unavoidable.
- If using an Authentik Redirect Stage, ensure it runs after successful login only, not before authentication.

### 6. Email UX

Keep SMTP configuration in Docker environment variables, not in the Authentik UI:

```env
AUTHENTIK_EMAIL__HOST=smtppro.zoho.eu
AUTHENTIK_EMAIL__PORT=587
AUTHENTIK_EMAIL__USERNAME=admin@westgate.pw
AUTHENTIK_EMAIL__USE_TLS=true
AUTHENTIK_EMAIL__USE_SSL=false
AUTHENTIK_EMAIL__FROM=noreply@westgate.pw
```

Requirements:

- Do not break existing working mail authentication.
- Investigate whether Authentik email templates can be safely overridden in the deployed Authentik version before changing templates.
- If template override is risky, only improve subject and branding for now.

### 7. Safety And Rollback

- Before changing NodeBB templates or Authentik flows, document current settings.
- Prefer reversible theme/template changes.
- Do not delete existing Authentik flows or providers.
- Test in a private window after every auth change.

Confirm after each meaningful auth change:

- Existing users can log in.
- New users do not create duplicate accounts.
- Password reset works.
- Gitea login still works.

## Success Criteria

- A normal user starts at `forum.westgate.pw`.
- They can register, log in, reset their password, and reach Gitea without understanding Authentik exists.
- Any Authentik page they briefly see looks like Westgate account infrastructure.
- No duplicate NodeBB accounts are created.
- Password recovery emails send from `noreply@westgate.pw`.
- Password recovery emails pass SPF, DKIM, and DMARC.

## Implementation Analysis

### NodeBB Findings

This theme is a small Harmony child theme. `theme.json` uses `baseTheme: "nodebb-theme-harmony"`, and `plugin.json` exposes local templates from `templates/`. Any auth template override should therefore be narrowly copied from the active NodeBB/Harmony source and kept in `templates/`, not added as broad root-level styling or a larger theme rewrite.

Current local theme state:

- The theme does not currently override `login.tpl`, `register.tpl`, `reset.tpl`, `reset_code.tpl`, or auth-related navigation partials.
- `lib/theme.js` already registers widget areas for `login.tpl` and `register.tpl`, so local auth template overrides must preserve widget regions if those pages remain renderable.
- `filter:config.get` is already implemented in `lib/theme.js`, which is the right place to expose configured Westgate account URLs to templates/client code.
- `public/client.js` exists and can be used for small defensive link normalization, but primary behavior should be server-rendered templates and NodeBB/auth settings.
- Account pages are inherited from Harmony and generally import `partials/account/header.tpl`, which then imports `partials/account/sidebar-left.tpl`.
- `lib/theme.js` already uses `filter:user.profileMenu` to add the local Theme Settings profile item. This hook can also add Westgate account-management links without overriding every account template.
- Harmony's account sidebar renders `profile_links` after the standard account links, making it a low-risk insertion point for user-facing account actions.
- The account edit page includes native password, username, email, SSO association, and profile-picture controls. Password/account-security items need special handling when Authentik owns identity.

Relevant NodeBB/Harmony auth surfaces found in the working install:

- `src/views/login.tpl`
  - Local login form.
  - Native `Forgot password?` link to `/reset`.
  - Registration CTA to `/register`.
  - Alternate login buttons from `authentication`.
- `src/views/register.tpl`
  - Native local registration form.
  - Alternate registration buttons from `authentication`.
- `src/views/reset.tpl`
  - Native NodeBB password reset request form.
- `src/views/reset_code.tpl`
  - Native NodeBB password reset completion form.
- `nodebb-theme-harmony/templates/partials/sidebar/logged-out-menu.tpl`
  - Desktop sidebar login/register links.
- `nodebb-theme-harmony/templates/partials/mobile-nav.tpl`
  - Mobile login/register links.
- `nodebb-theme-harmony/templates/partials/topic/reply-button.tpl`
  - Guest reply login CTA.
- `nodebb-theme-harmony/templates/partials/topic-list-bar.tpl`
  - Guest posting login CTA.
- `nodebb-theme-harmony/templates/world.tpl`
  - Guest login/register buttons.
- `src/views/partials/topic/guest-cta.tpl`
  - Guest topic CTA login/register buttons.
- `nodebb-theme-harmony/templates/account/edit.tpl`
  - Native account edit page, including change password, change username, change email, and SSO association blocks.
- `nodebb-theme-harmony/templates/account/edit/password.tpl`
  - Native NodeBB password change form.
- `nodebb-theme-harmony/templates/account/sessions.tpl`
  - NodeBB session management page.
- `nodebb-theme-harmony/templates/partials/account/sidebar-left.tpl`
  - Shared account navigation and `profile_links` insertion point.

Important NodeBB behavior:

- `src/controllers/index.js` builds login data from configured login strategies.
- If local login is not allowed, public registration is not normal, and exactly one alternate login strategy exists, NodeBB redirects `/login` directly to that strategy.
- This means the safest target for most forum login links is still `/login`, provided NodeBB settings are configured so `/login` becomes the SSO launch point.

### Authentik Findings

The Authentik side is operational but needs productization:

- Authentik is already the SSO source for NodeBB.
- Gitea is already downstream.
- Zoho SMTP and DNS authentication already work.
- The remaining work is mostly flow choice, branding, redirect behavior, and avoiding accidental exposure of native NodeBB account actions.

Authentik documentation confirms:

- Email configuration can be kept in Docker environment variables, including host, port, TLS/SSL, username, password, timeout, and from address.
- Authentik email sending can be tested with `ak test_email`.
- Email stages can use global email settings and support account-recovery rate limiting.
- Authentik supports custom email templates, but templates should only be changed after confirming the deployed version and template override path.
- Redirect stages exist for post-flow redirects, including static URL redirects and flow redirects, but must be placed so they run after successful authentication/recovery, not before the user has authenticated.
- Flow appearance settings and branding can control visible naming, layout, and background imagery.
- Authentik has a user settings executor at `/if/user/`, but it is still visibly Authentik unless branding and flow titles are cleaned up.
- Authentik supports TOTP setup stages, WebAuthn/FIDO2/passkey setup stages, and authenticator validation stages.
- Authenticator validation can validate already configured devices and can be configured to skip, deny, or require configuration when no device is present.
- Authentik's example flows include two-factor login and recovery with email plus MFA verification.

Reference docs:

- Authentik email configuration: https://docs.goauthentik.io/install-config/email/
- Authentik configuration variables: https://docs.goauthentik.io/install-config/configuration/
- Authentik flows: https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/
- Authentik email stage: https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/email/
- Authentik redirect stage: https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/redirect/
- Authentik user settings executor: https://docs.goauthentik.io/docs/add-secure-apps/flows-stages/flow/executors/user-settings
- Authentik TOTP setup stage: https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/authenticator_totp/
- Authentik WebAuthn/passkey setup stage: https://docs.goauthentik.io/docs/add-secure-apps/flows-stages/stages/authenticator_webauthn/
- Authentik authenticator validation stage: https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/authenticator_validate/
- Authentik example flows: https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/flows/
- NodeBB child theme/template behavior: https://docs.nodebb.org/development/themes/

### Account-Page Action Tokens

It is possible to place specific account-management controls on NodeBB user account pages, but the implementation should use safe action URLs and template data, not embedded Authentik access tokens, OAuth client secrets, recovery tokens, or bearer tokens.

Recommended model:

- Render the action surface in NodeBB first.
- Expose named account action URLs from `config.westgateAccount`.
- Add self-only profile menu links through `filter:user.profileMenu` for broad account-page navigation.
- Override focused account templates only where the native NodeBB action must be replaced, such as password changes.
- Use existing NodeBB routes/pages wherever possible instead of adding new behavior in this theme.
- Fall back to a branded Authentik flow URL only when direct NodeBB handling would mean reimplementing Authentik security or exposing secrets.
- Do not render Authentik API tokens, session tokens, provider secrets, or password-reset tokens into NodeBB HTML.

Useful safe action slots:

- Account sidebar links through `profile_links`:
  - `Manage Westgate Account`
  - `Change Password`
  - `Set Up Two-Factor Authentication`
  - `Recovery Options`
- Account edit action list in `account/edit.tpl`:
  - Replace native `Change password` with an Authentik password/recovery/settings action.
  - Consider replacing native `Change email` and `Change username` if Authentik is the source of truth for those fields.
- Password edit page in `account/edit/password.tpl`:
  - Replace the form with a branded button to the Authentik password-management or recovery flow.
- Sessions page in `account/sessions.tpl`:
  - Keep NodeBB session management if it remains useful, but add a clear link to manage global Westgate/Authentik sessions if exposed safely.

If the user meant literal security tokens, the answer is no for public rendering. Those belong in server-side configuration, Authentik, or the relevant provider, never in templates or client JavaScript.

### Direct NodeBB Integration Feasibility

The implementation should follow this escalation ladder for every account action:

1. Native NodeBB render through theme template overrides with Authentik as backend authority.
2. Existing NodeBB page with one clear action button that opens a branded Authentik flow for the final sensitive step.
3. Dedicated plugin/infrastructure work, if a true server-side integration is needed.
4. Direct Authentik page only when the action cannot be completed safely from NodeBB or a dedicated integration.

Likely direct NodeBB surfaces:

- Login entry points and CTAs.
- Registration landing page and registration closed/pending messaging.
- Password recovery request page, if Authentik recovery can be initiated safely server-side.
- Account overview page.
- Account edit action list.
- Account sidebar links.
- Password/security explanation pages.
- Email UX guidance and post-action confirmation pages.
- Staff/admin operational guidance.

Likely Authentik-required final steps:

- Entering a password into Authentik during login.
- Setting a new password during recovery, unless a stable Authentik API supports the full recovery exchange without weakening the flow.
- TOTP enrollment QR generation and validation, unless a stable user-scoped Authentik flow/API can be embedded safely.
- WebAuthn/passkey enrollment and validation, because browser origin, challenge handling, and Authentik session state are security-sensitive.
- MFA recovery or device reset.

Avoid iframe embedding Authentik into NodeBB. It is fragile with cookies, content security policy, clickjacking protections, and WebAuthn origin rules, and it would make security failures harder to debug. If Authentik must be shown, make the Authentik page itself look like Westgate.

### Security Boundary

The theme layer is security-hardened when it stays presentation-only.

Security rules for this repository:

- No Authentik API tokens in theme config, templates, SCSS, client JS, or committed docs.
- No OAuth client secrets in theme settings or environment variables consumed by the theme.
- No password collection except where NodeBB core already owns the page and the theme is explicitly replacing that form with a non-password UI.
- No custom password reset token generation.
- No custom enrollment token generation.
- No custom MFA device enrollment.
- No WebAuthn/passkey JavaScript in this theme.
- No iframe embedding of Authentik.
- No open redirects. Any configurable external URL must be treated as an admin-controlled deployment setting, and any return URL must be same-origin or ignored.
- No user-specific secret state in `config.get`, because that data is exposed to the browser.
- Client-side link rewriting is cosmetic defense in depth, not a security control.
- Security-critical behavior must be enforced in NodeBB settings, the SSO plugin, Authentik flows, or a dedicated plugin.

Security-critical assumptions to verify outside the theme:

- NodeBB local registration is disabled or otherwise cannot create duplicate accounts.
- NodeBB local login is disabled for normal users.
- A private admin break-glass path exists and is documented.
- Authentik OIDC subject/UID mapping is stable.
- Authentik redirect URIs are restricted to known Westgate URLs.
- Authentik recovery/enrollment flows do not leak account existence.
- MFA reset procedures are documented before MFA is required.

### Two-Factor Authentication Direction

Two-factor authentication should be owned by Authentik, not NodeBB, because Authentik is the shared identity provider for NodeBB, Gitea, and future services.

Recommended policy:

- Disable or avoid promoting NodeBB-local 2FA for normal users if Authentik MFA is enabled.
- Add NodeBB-facing links that open local Westgate security pages first, with Authentik shown only for final MFA setup or validation steps when necessary.
- Use Authentik TOTP and/or WebAuthn/passkeys for user-controlled MFA setup.
- Use an Authentik Authenticator Validation stage in the authentication flow.
- Start with optional/user-enrolled MFA, then move to required MFA for privileged groups if desired.
- Require MFA for admin/moderator or infrastructure-sensitive groups before requiring it for all users.
- Add MFA validation to account recovery only after basic recovery is stable.

MFA rollout options:

- Optional MFA:
  - Authenticator Validation Stage `Not configured action = Skip`.
  - Users can enroll through a Westgate account link.
- Prompt-to-configure MFA:
  - Authenticator Validation Stage `Not configured action = Configure`.
  - Best for staff or staged rollout.
- Required MFA:
  - Authenticator Validation Stage `Not configured action = Deny` or a configured flow that forces setup before successful login.
  - Use only after break-glass admin access and recovery behavior are proven.

Operational caution:

- Confirm at least two admin recovery paths before requiring MFA.
- Document how to reset a user's MFA device in Authentik.
- Test Gitea after enabling MFA, because the login challenge happens at Authentik and affects all downstream apps.

## Shipping Plan For An Agent

### Phase 0: Gather Required Configuration

Before editing code or Authentik flows, collect these values and record them in deployment notes outside this public theme repo if any secrets are involved:

- Forum public URL, expected to be `https://forum.westgate.pw`.
- Authentik public URL.
- NodeBB SSO plugin name and generated login route, for example `/auth/<strategy>` or similar.
- Authentik application/provider used by NodeBB.
- Authentik application/provider used by Gitea.
- Authentik authentication flow slug.
- Authentik recovery flow slug.
- Authentik enrollment flow slug, if public enrollment is enabled.
- Current Authentik version.
- Current NodeBB registration setting.
- Current NodeBB local-login privilege state.
- Current Authentik email stage names and subjects.
- Current Authentik branding settings.

Do not proceed with irreversible configuration changes until the current settings have been screenshotted or exported.

### Phase 1: Decide The Account Surface Model

Use this target model unless testing proves it incompatible with the active SSO plugin:

- `/login` remains the canonical NodeBB-facing login URL.
- NodeBB configuration makes `/login` redirect directly to the single Authentik SSO strategy.
- `/register` should render a Westgate/NodeBB page, not the native NodeBB registration form.
- `/reset` should render a Westgate/NodeBB page, not the native NodeBB password reset form.
- `/user/{userslug}/edit/password` should render a Westgate/NodeBB page, not the native NodeBB password-change form.
- Existing account pages such as `/user/{userslug}/edit`, `/user/{userslug}/edit/password`, `/user/{userslug}/settings`, and `/user/{userslug}/sessions` should be directly adjusted through theme template overrides.
- New `/account/*` routes are not part of the theme-first implementation. Add them only through a dedicated plugin or supported NodeBB custom-page mechanism if a later phase needs real new pages.

Rationale:

- Keeping `/login` as the public link preserves NodeBB return-to behavior and compatibility with existing core links.
- Disabling local NodeBB registration avoids duplicate account creation.
- Moving recovery to Authentik keeps password ownership in one system.
- Rendering account surfaces in NodeBB preserves the Westgate account mental model even when Authentik performs the final identity step.
- Using existing NodeBB pages keeps this repo in its proper theme boundary.

Directness rule:

- Do not send users to Authentik merely because a link exists.
- First attempt a NodeBB-rendered page.
- If a server-side integration is needed, mark it as dedicated plugin or infrastructure work, not theme work.
- Use a branded Authentik flow URL only for login, MFA, password-entry, enrollment, recovery completion, or other identity-critical steps that Authentik must own.

### Phase 2: Configure NodeBB Account Settings

In the NodeBB ACP or equivalent configuration:

- Disable normal public local registration unless the SSO plugin explicitly requires it for account completion.
- Disable local login for guests by removing the `groups:local:login` privilege where appropriate.
- Keep administrator break-glass access documented. If local admin login must remain available, use NodeBB's `?local=1` behavior only for known admin access and do not expose it in public UI.
- Confirm there is exactly one public alternate login strategy for normal users.
- Confirm `/login` redirects to the Authentik strategy when:
  - user is logged out,
  - local login is disabled,
  - public registration is disabled,
  - exactly one alternate login strategy is available.

Rollback:

- Re-enable `groups:local:login`.
- Restore previous registration setting.
- Disable or revert local template overrides.

### Phase 3: Add Theme Configuration For Account URLs

Implement in `lib/theme.js` through the existing `filter:config.get` hook:

- `config.westgateAccount.loginUrl`
- `config.westgateAccount.registerUrl`
- `config.westgateAccount.recoveryUrl`
- `config.westgateAccount.manageUrl`
- `config.westgateAccount.passwordUrl`
- `config.westgateAccount.mfaUrl`
- `config.westgateAccount.sessionsUrl`
- `config.westgateAccount.localLoginUrl`

Preferred source order:

1. Environment variables from the NodeBB process.
2. Theme ACP settings if the theme settings page is expanded for this.
3. Conservative defaults:
   - login: `{relative_path}/login`
   - register: `{relative_path}/register`
   - recovery: `{relative_path}/reset`
   - manage: current user's `/user/{userslug}/edit`
   - password: current user's `/user/{userslug}/edit/password`
   - MFA: current user's `/user/{userslug}/settings` or `/user/{userslug}/edit/password` until a dedicated local security page exists
   - sessions: `{relative_path}/user/{userslug}/sessions` or Authentik user settings if configured
   - local login: `{relative_path}/login?local=1`

Use environment variable names like:

```env
WESTGATE_ACCOUNT_LOGIN_URL=/login
WESTGATE_ACCOUNT_REGISTER_URL=/register
WESTGATE_ACCOUNT_RECOVERY_URL=/reset
WESTGATE_ACCOUNT_MANAGE_URL=
WESTGATE_ACCOUNT_PASSWORD_URL=
WESTGATE_ACCOUNT_MFA_URL=
WESTGATE_ACCOUNT_SESSIONS_URL=
WESTGATE_ACCOUNT_LOCAL_LOGIN_URL=/login?local=1
WESTGATE_AUTHENTIK_REGISTER_URL=
WESTGATE_AUTHENTIK_RECOVERY_URL=
WESTGATE_AUTHENTIK_USER_SETTINGS_URL=
WESTGATE_AUTHENTIK_PASSWORD_URL=
WESTGATE_AUTHENTIK_MFA_URL=
WESTGATE_AUTHENTIK_SESSIONS_URL=
```

Do not hardcode Authentik hostnames into templates.

### Phase 4: Inject Into Existing NodeBB Account Pages

Use existing NodeBB pages and Harmony templates rather than adding new route behavior in the theme.

Primary page targets:

- `/register`
  - Override `templates/register.tpl`.
  - Render Westgate account creation UX.
  - Use an action button to the configured Authentik enrollment flow only when enrollment must happen outside NodeBB.
- `/reset`
  - Override `templates/reset.tpl`.
  - Render Westgate password recovery UX.
  - Use an action button to the configured Authentik recovery flow only when recovery must happen outside NodeBB.
- `/user/{userslug}/edit`
  - Override `templates/account/edit.tpl`.
  - Keep NodeBB-owned profile controls.
  - Replace identity-owned controls with Westgate account actions.
- `/user/{userslug}/edit/password`
  - Override `templates/account/edit/password.tpl`.
  - Replace the native password form with Westgate password management UI.
- `/user/{userslug}/settings`
  - Leave notification/forum preferences intact.
  - Add account-security affordances only if the template can be kept focused and maintainable.
- `/user/{userslug}/sessions`
  - Keep NodeBB session management.
  - Label it as forum sessions if Authentik global sessions are separate.

Implementation guardrails:

- Do not add POST handlers in this theme for recovery, enrollment, password changes, or MFA.
- Do not call Authentik APIs from this theme.
- Do not add service credentials to the NodeBB theme process.
- Do not embed Authentik access tokens, recovery tokens, or client secrets into rendered pages.
- Do not iframe Authentik flows into NodeBB.
- Treat each Authentik URL as a final sensitive-step target, not as the default visible page.

Out-of-scope for this theme:

- `POST /account/recover`
- `POST /account/register`
- Authentik API-backed MFA status checks.
- Authentik API-backed enrollment or recovery initiation.
- Any route that requires service credentials.

If these become necessary, create a dedicated NodeBB plugin or infrastructure task and have this theme link to the resulting safe local route.

### Phase 4A: Add Account-Page Action Links

Use the existing `filter:user.profileMenu` hook in `lib/theme.js` to add self-only Westgate account links to Harmony's account sidebar.

Add links such as:

- `Manage Westgate Account`
- `Change Password`
- `Two-Factor Authentication`
- `Recovery Options`

Implementation notes:

- Use `visibility.self = true` and keep the links private to the current user.
- Prefer existing local NodeBB account URLs generated from safe config, not direct Authentik URLs.
- Keep existing Theme Settings profile link.
- Do not show these links on other users' profiles.
- Do not show Authentik admin URLs or internal provider URLs.
- Validate that the sidebar remains usable on mobile widths.

If template placement needs to be more exact than the `profile_links` area allows, override `templates/partials/account/sidebar-left.tpl` and copy only the minimum Harmony markup needed.

### Phase 5: Override Only Necessary Templates

Create local template overrides only for auth entry points that must change.

High-priority overrides:

- `templates/reset.tpl`
  - Replace native reset form with a Westgate recovery page.
  - Show one Westgate-styled action to the branded Authentik recovery flow unless a separate plugin/infrastructure integration later provides a safe local handler.
  - Do not auto-redirect on page load; the user should remain on a NodeBB-rendered page until they choose the action.
- `templates/register.tpl`
  - Replace native registration form with a Westgate account creation page.
  - If enrollment can be safely initiated through NodeBB, collect only the minimum fields that Authentik expects and submit server-side.
  - If enrollment must happen in Authentik, show a single Westgate-styled action to continue.
  - If registration is closed, show concise Westgate-branded copy and a login button.
- `templates/login.tpl`
  - Prefer leaving `/login` to NodeBB's auto-redirect behavior.
  - If it renders, remove or hide native local form for normal users and show one Westgate SSO button.
  - Keep a non-public local admin fallback only if required, for example a small link controlled by configuration or only visible with `?local=1`.
- `templates/account/edit.tpl`
  - Replace native account-security actions with local Westgate account action links where identity is Authentik-owned.
  - Leave profile-only NodeBB controls intact when NodeBB remains the source of truth, such as avatar, cover, about me, and local forum preferences.
  - Keep SSO association information if useful, but relabel it so it reads as Westgate account linking rather than generic third-party auth.
- `templates/account/edit/password.tpl`
  - Replace the native NodeBB password change form with a Westgate password management page.
  - Show a local action button to `config.westgateAccount.passwordUrl` or `config.westgateAccount.recoveryUrl`.
  - Do not accept or process passwords in the theme.
- `templates/account/sessions.tpl`
  - Keep NodeBB sessions visible as "Forum sessions".
  - Add a Westgate account sessions section only if Authentik exposes a safe user-facing session-management endpoint.
  - Do not imply that revoking a NodeBB session revokes all Westgate services unless Authentik logout/session invalidation is integrated.
- Avoid new account-route templates unless a dedicated plugin or supported custom-page mechanism owns those routes.

Navigation/CTA overrides to inspect after settings are applied:

- `templates/partials/sidebar/logged-out-menu.tpl`
- `templates/partials/mobile-nav.tpl`
- `templates/partials/topic/reply-button.tpl`
- `templates/partials/topic-list-bar.tpl`
- `templates/world.tpl`
- `templates/partials/topic/guest-cta.tpl`

For each override:

- Copy only the minimum needed from Harmony or NodeBB core.
- Preserve accessibility labels.
- Preserve existing component attributes where NodeBB client code depends on them.
- Point login actions to `config.westgateAccount.loginUrl`.
- Point register actions to `config.westgateAccount.registerUrl`.
- Point forgot-password actions to `config.westgateAccount.recoveryUrl`.
- Point account security/password/MFA actions to the relevant `config.westgateAccount.*Url`.
- Prefer these local URLs over direct Authentik URLs. Direct Authentik URLs belong behind final action buttons or server-side handlers only.

### Phase 5A: Two-Factor Authentication Implementation

Implement MFA in Authentik, then expose it through NodeBB.

Authentik setup:

- Confirm the active Brand title is Westgate-specific before TOTP rollout, because authenticator app issuer naming follows the active brand.
- Create or confirm a TOTP Authenticator Setup stage.
- Create or confirm a WebAuthn/FIDO2/passkey setup stage if passkeys should be supported.
- Add an Authenticator Validation stage to the authentication flow.
- For initial rollout, set `Not configured action` to `Skip` for normal users or use group policies to require it only for staff.
- For staff rollout, prefer `Configure` or `Deny` only after recovery and admin break-glass paths are documented.
- Add a clear Authentik user-facing route for MFA setup, then set `WESTGATE_AUTHENTIK_MFA_URL` to that route.

NodeBB setup:

- Add a `Two-Factor Authentication` link to the account sidebar using `filter:user.profileMenu`, pointing to an existing NodeBB account page or a future plugin-owned local security page.
- Render MFA entry points inside an existing NodeBB account template where possible.
- Show neutral copy and a single action to continue to the branded Authentik MFA setup flow.
- Replace or avoid any NodeBB-local 2FA controls if present, so users do not configure two different MFA systems.
- Add text only where unavoidable; prefer a direct action button that keeps the Westgate account mental model.
- Do not iframe Authentik MFA setup.
- Do not generate TOTP secrets in NodeBB.
- Do not implement WebAuthn challenge handling in this theme.

Validation:

- User without MFA can still log in during optional rollout.
- User with TOTP enabled is prompted during Authentik login.
- User with WebAuthn/passkey enabled can authenticate on desktop and mobile where supported.
- Staff-required MFA does not lock out administrators.
- Gitea login still works and enforces the same Authentik MFA challenge.
- Recovery flow behavior is known for users who lose MFA devices.
- The user starts from NodeBB account security and only sees Authentik if the final MFA setup/validation step requires it.

### Phase 6: Add Defensive Client Link Normalization

Use `public/client.js` only as a compatibility layer for links emitted by plugins or core JavaScript after initial render.

Client behavior:

- On page load and `action:ajaxify.end`, find public guest links to `/register` and `/reset`.
- Rewrite them to `config.westgateAccount.registerUrl` and `config.westgateAccount.recoveryUrl`.
- Optionally rewrite self-account links to native password/security pages only if server-rendered template overrides cannot cover all cases.
- Leave `/login` alone unless a specific rendered link bypasses the desired `/login` SSO redirect.
- Do not rewrite ACP links.
- Do not rewrite links when the URL includes `local=1`.

This should be treated as defense in depth, not the primary implementation.

### Phase 7: Configure Authentik Branding

In Authentik Admin:

- Set tenant/brand name to `Shadows Over Westgate` or `Westgate`.
- Set browser/page titles so user-facing pages do not say generic `authentik`.
- Upload a logo/icon matching the NodeBB theme.
- Use dark plum/near-black and muted gold where Authentik supports custom colors.
- Set flow background imagery or styling to match the Westgate theme without reducing readability.
- Update visible flow titles:
  - Login: `Sign in to Westgate`
  - Recovery: `Recover your Westgate account`
  - Enrollment: `Create your Westgate account`
- Avoid Authentik dashboard language for end users where possible.

Acceptance check:

- Open login, recovery, and enrollment flows directly in a private window.
- Confirm they look like Westgate infrastructure, not a stock identity provider.

### Phase 8: Configure Authentik Flows

Authentication flow:

- Keep the existing working NodeBB provider/flow unless there is a clear reason to clone it.
- If flow changes are needed, clone first and switch the provider only after testing.
- Ensure successful login returns to NodeBB through the OIDC/OAuth callback.
- Do not place a Redirect Stage before identification/password stages.

Recovery flow:

- Confirm the recovery flow identifies the user, sends recovery email, accepts the new password, writes it to Authentik, and then returns users back to NodeBB.
- Prefer a NodeBB-rendered recovery request page over direct Authentik recovery page entry.
- Prefer redirecting to `https://forum.westgate.pw/login` or a post-recovery NodeBB route.
- If using a Redirect Stage, bind it after successful password update.
- Confirm a failed or expired recovery link shows branded error handling.
- Decide whether recovery requires MFA validation for users with MFA configured. Do this after basic recovery is proven.

Enrollment flow:

- Decide whether public enrollment is enabled.
- If enabled, start with a NodeBB-rendered account creation page.
- Ensure enrollment creates users in Authentik first, then lets NodeBB create/link the local account only through SSO callback.
- Use a direct Authentik enrollment page only for the actual identity-account creation step if no stable server-side enrollment initiation is available.
- If disabled, route registration CTAs to a local branded "account creation is currently closed" experience, not native NodeBB registration.

Gitea:

- Do not change the Gitea provider until NodeBB login/recovery is stable.
- After Authentik flow changes, test Gitea login with an existing user.

MFA:

- Treat MFA as an Authentik shared identity control, not a NodeBB-only setting.
- Start with optional MFA links from NodeBB account pages.
- Move to staff-required MFA only after admin recovery/reset procedures are documented.
- Consider all-user required MFA only after support expectations are clear.

### Phase 9: Email UX

Keep working SMTP settings in Docker environment, not Authentik UI:

```env
AUTHENTIK_EMAIL__HOST=smtppro.zoho.eu
AUTHENTIK_EMAIL__PORT=587
AUTHENTIK_EMAIL__USERNAME=admin@westgate.pw
AUTHENTIK_EMAIL__USE_TLS=true
AUTHENTIK_EMAIL__USE_SSL=false
AUTHENTIK_EMAIL__FROM=noreply@westgate.pw
```

Additional setup:

- Ensure the SMTP password/secret remains configured exactly as it is today.
- If using a display name, prefer a safe format supported by Authentik, for example `Westgate <noreply@westgate.pw>`.
- Update the recovery email subject to `Reset your Westgate account password`.
- Confirm Authentik's Email stage uses global email settings unless there is a deliberate reason to override them.
- Configure recovery email rate limiting on the Email stage.
- Run Authentik's email test command from the Authentik deployment host:

```sh
docker compose exec worker ak test_email test-recipient@example.com
```

Template decision:

- First ship subject/from/branding improvements.
- Only override custom email templates after confirming the deployed Authentik version and the exact `custom-templates` mount path.
- If templates are changed, add both HTML and text templates when supported by the deployed version.

### Phase 10: Build And Validate Locally

From the theme repo:

- Run lint/build checks available for the theme, if any.

From the NodeBB install:

```sh
./nodebb build
./nodebb start
```

Or use the project's existing Grunt hot-reload workflow if actively developing.

Browser validation against `http://localhost:4567`:

- Logged-out desktop:
  - `/`
  - `/login`
  - `/register`
  - `/reset`
  - `/categories`
  - a topic page with guest reply CTA
  - a category page with guest post CTA
- Logged-out mobile:
  - mobile navigation login/register links
  - `/login`
  - `/register`
  - `/reset`
- Logged-in:
  - profile account settings
  - account sidebar Westgate action links
  - security/password-related pages
  - MFA setup link behavior
  - logout and login again

Expected local results:

- Public login starts NodeBB and enters Authentik SSO.
- Public register shows a Westgate/NodeBB account creation page, not the native NodeBB form.
- Public password reset shows a Westgate/NodeBB recovery page, not the native NodeBB reset form.
- No public link intentionally sends a normal user to stock Authentik dashboard pages.
- Account page links first use existing local Westgate/NodeBB account-management pages.
- Direct Authentik navigation occurs only from explicit final-step actions or server-side handlers.
- Native NodeBB password changes are not presented as the primary path.
- Theme still renders without template errors.

### Phase 11: Production Validation

Use a private/incognito browser after every auth change:

- Existing user can log in from `https://forum.westgate.pw`.
- Existing user lands back on the forum after login.
- New user registration/enrollment does not create duplicate NodeBB accounts.
- Password recovery email sends from `noreply@westgate.pw`.
- Password recovery email passes SPF, DKIM, and DMARC.
- Password recovery completes and returns the user to NodeBB.
- Account page `Manage`, `Change Password`, and `Two-Factor Authentication` links resolve to existing NodeBB-rendered pages or a separately owned local integration page first.
- Any unavoidable Authentik flow step returns to NodeBB or presents an obvious path back.
- Optional MFA setup works for at least one test user.
- If staff-required MFA is enabled, a staff test user is challenged and a non-staff test user follows the expected policy.
- Gitea login still works for an existing user.
- Authentik "My Applications" is not shown during normal NodeBB login/recovery unless unavoidable.
- Admin break-glass local login path still works if intentionally retained.

### Phase 12: Rollback Plan

NodeBB rollback:

- Revert theme template, page, route, and handler changes.
- Rebuild NodeBB assets.
- Restore previous NodeBB registration setting.
- Restore previous local-login privilege.
- Confirm `/login`, `/register`, and `/reset` render as before.

Authentik rollback:

- Switch providers back to the previous flow if a cloned flow was introduced.
- Remove or disable new Redirect Stage bindings.
- Remove or relax Authenticator Validation stage bindings if MFA causes lockout risk.
- Restore previous branding only if the new branding causes functional issues.
- Keep working SMTP environment variables unchanged.

Do not delete old Authentik flows/providers during rollout. Disable or disconnect only after the new path has been validated in production.

## Implementation Order

Ship this in small, reversible slices. Each slice should be deployable on its own and should reduce Authentik visibility without blocking the next slice.

### Slice 1: NodeBB Account Surface Skeleton

Code:

- Add `config.westgateAccount` values in `lib/theme.js`.
- Override existing NodeBB auth/account templates rather than adding new routes.
- Add Westgate account surfaces to `/register`, `/reset`, `/user/{userslug}/edit`, and `/user/{userslug}/edit/password`.
- Add self-only account sidebar links through `filter:user.profileMenu`.

Validation:

- Existing pages render for logged-in and logged-out users as expected.
- No Authentik URLs are exposed except behind explicit action buttons.
- Existing forum account/profile pages still render.

### Slice 2: Replace Public Auth Entry Points

Code:

- Override `register.tpl` and `reset.tpl` to render the new Westgate surfaces.
- Audit and override guest CTAs in sidebar, mobile nav, reply/post prompts, and topic guest CTAs.
- Add defensive client-side normalization for plugin-emitted `/register` and `/reset` links.

Validation:

- Logged-out desktop and mobile users see Westgate pages for register/reset.
- Native NodeBB registration and reset forms are no longer public.
- `/login` still enters the working Authentik SSO path.

### Slice 3: Replace Account Security Actions

Code:

- Override `account/edit.tpl` only around the action list if possible.
- Override `account/edit/password.tpl` with the Westgate password page.
- Keep NodeBB-owned profile controls intact.
- Keep NodeBB sessions visible, but label them clearly as forum sessions.

Validation:

- Account pages feel native to NodeBB.
- Users are not offered a NodeBB-local password change as the primary path.
- Profile editing still works.

### Slice 4: Authentik Branding And Return Behavior

Configuration:

- Apply Westgate branding to Authentik.
- Configure recovery/enrollment/login flow titles.
- Confirm post-login and post-recovery return behavior goes back to NodeBB.
- Keep SMTP environment variables unchanged.

Validation:

- Any unavoidable Authentik screen looks like Westgate infrastructure.
- Password recovery email still sends from `noreply@westgate.pw`.

### Slice 5: Non-Theme Integration Spike

Investigate whether future plugin/infrastructure work is justified:

- Can NodeBB initiate Authentik recovery email server-side without exposing secrets or bypassing flow protections?
- Can NodeBB initiate enrollment server-side without causing duplicate accounts?
- Can NodeBB read MFA configured/not-configured status for the current user using a safe service credential or user-scoped token?

Decision rules:

- If a stable deployed-version API or supported flow endpoint exists, implement it in a dedicated NodeBB plugin or infrastructure component, not this theme.
- If not, keep the theme page and use a final action button to a branded Authentik flow.
- Do not reverse-engineer private endpoints.
- Do not store user passwords, MFA secrets, WebAuthn challenges, or Authentik session material in NodeBB.

### Slice 6: MFA Rollout

Configuration:

- Add or confirm TOTP/WebAuthn setup stages.
- Add Authenticator Validation stage with optional behavior first.
- Add staff-only requirement only after optional setup and break-glass recovery are proven.

Validation:

- Optional MFA works for a test user.
- Staff-required MFA works if enabled.
- Gitea login still passes through the same Authentik MFA challenge.

## Agent Work Checklist

- [ ] Snapshot current NodeBB auth settings, SSO plugin settings, and Authentik flow/provider settings.
- [ ] Confirm the active NodeBB SSO strategy route and whether `/login` can auto-redirect to it.
- [ ] Configure NodeBB local login/registration so native account creation is not public.
- [ ] Add theme account URL config in `lib/theme.js`.
- [ ] Use existing NodeBB pages for account UI; do not add theme-owned auth backend routes.
- [ ] Track any Authentik recovery/enrollment/MFA API integration as non-theme plugin/infrastructure work.
- [ ] Add self-only Westgate account action links through `filter:user.profileMenu`.
- [ ] Override `reset.tpl` to render Westgate recovery UX and avoid native NodeBB recovery.
- [ ] Override `register.tpl` to avoid native NodeBB registration.
- [ ] Override `login.tpl` only if NodeBB's built-in SSO redirect is insufficient.
- [ ] Override account password/security templates so NodeBB-local password management is no longer the primary path.
- [ ] Audit and override guest login/register CTAs that still point to native flows.
- [ ] Add defensive client-side link normalization for plugin-emitted `/register` and `/reset` links.
- [ ] Configure Authentik branding.
- [ ] Configure Authentik recovery/enrollment return behavior so unavoidable Authentik steps return to NodeBB.
- [ ] Configure Authentik MFA setup and validation stages.
- [ ] Expose MFA setup through a NodeBB account security page, with Authentik shown only for the final setup/validation step if needed.
- [ ] Update recovery email subject/from display without changing working SMTP auth.
- [ ] Build NodeBB assets.
- [ ] Validate desktop/mobile logged-out auth routes.
- [ ] Validate existing user login, new user enrollment, password recovery, MFA setup/challenge behavior, and Gitea login.
- [ ] Document final configured URLs, flow names, rollback settings, and remaining operational follow-up.
