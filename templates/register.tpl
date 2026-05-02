<div data-widget-area="header">
	{{{each widgets.header}}}
	{{widgets.header.html}}
	{{{end}}}
</div>

<div class="row register flex-fill wg-account-page">
	<div class="d-flex flex-column gap-2 {{{ if widgets.sidebar.length }}}col-lg-9 col-sm-12{{{ else }}}col-lg-12{{{ end }}}">
		<section class="wg-account-panel mx-auto" aria-labelledby="wg-register-title">
			<div class="wg-account-kicker">Westgate account</div>
			<h2 id="wg-register-title" class="wg-account-title">Create your Westgate account</h2>
			<p class="wg-account-copy">
				Your forum account is part of the shared Westgate sign-in used for Shadows Over Westgate services. Continue through the account gate to create it; the forum will finish linking your profile after sign-in.
			</p>

			<div class="wg-account-actions">
				<a class="btn btn-primary btn-lg" href="{config.westgateAccount.registerActionUrl}" target="_top" rel="nofollow">
					Continue to account creation
				</a>
				<a class="btn btn-outline-secondary btn-lg" href="{config.westgateAccount.loginUrl}">
					I already have an account
				</a>
			</div>

			<p class="wg-account-note">
				If account creation is currently closed, sign in with an existing account or contact staff through the usual community channels.
			</p>
		</section>
	</div>

	<div data-widget-area="sidebar" class="col-lg-3 col-sm-12 {{{ if !widgets.sidebar.length }}}hidden{{{ end }}}">
		{{{each widgets.sidebar}}}
		{{widgets.sidebar.html}}
		{{{end}}}
	</div>
</div>

<div data-widget-area="footer">
	{{{each widgets.footer}}}
	{{widgets.footer.html}}
	{{{end}}}
</div>
