<!-- IMPORT partials/account/header.tpl -->

<div class="wg-account-page wg-account-page--profile">
	<section class="wg-account-panel wg-account-panel--wide" aria-labelledby="wg-sessions-title">
		<div class="wg-account-kicker">Forum sessions</div>
		<h3 id="wg-sessions-title" class="wg-account-title fs-4">Forum sessions</h3>
		<p class="wg-account-copy">
			These are active sessions for this forum. Ending one here signs that browser out of NodeBB, but it may not revoke sessions for other Westgate services.
		</p>

		<ul class="list-group wg-account-session-list" component="user/sessions">
			<!-- IMPORT partials/account/session-list.tpl -->
		</ul>

		{{{ if isSelf }}}
		<div class="wg-account-actions mt-3">
			<a class="btn btn-outline-secondary" href="{config.westgateAccount.globalSessionsActionUrl}" target="_top" rel="nofollow">
				Manage Westgate account sessions
			</a>
		</div>
		{{{ end }}}
	</section>
</div>

<!-- IMPORT partials/account/footer.tpl -->
