<!-- IMPORT partials/account/header.tpl -->

<div class="wg-account-page wg-account-page--profile">
	<section class="wg-account-panel" aria-labelledby="wg-password-title">
		<div class="wg-account-kicker">Account security</div>
		<h3 id="wg-password-title" class="wg-account-title fs-4">{{{ if isSelf }}}Change your Westgate password{{{ else }}}[[pages:{template.name}, {username}]]{{{ end }}}</h3>

		{{{ if isSelf }}}
		<p class="wg-account-copy">
			Westgate passwords are managed by the shared account system, not by the forum profile editor. Continue to the account flow to change or recover your password.
		</p>

		<div class="wg-account-actions">
			<a class="btn btn-primary" href="{config.westgateAccount.passwordActionUrl}" target="_top" rel="nofollow">
				Continue to password management
			</a>
			<a class="btn btn-outline-secondary" href="{config.relative_path}/user/{userslug}/edit">
				Back to profile settings
			</a>
		</div>

		<p class="wg-account-note">
			This page does not collect your current or new password. Sensitive password steps happen only in the Westgate account flow.
		</p>
		{{{ else }}}
		<p class="wg-account-copy">
			Password management for this account belongs to the shared Westgate account system.
		</p>
		{{{ end }}}
	</section>
</div>

<!-- IMPORT partials/account/footer.tpl -->
