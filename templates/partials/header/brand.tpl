{{{ if (brand:logo || (config.showSiteTitle || widgets.brand-header.length)) }}}
<div class="container-lg px-md-4 brand-container westgate-brand-hero">
	<div class="westgate-brand-hero__veil"></div>
	<div class="d-flex westgate-brand-hero__inner {{{ if config.theme.centerHeaderElements }}}justify-content-left{{{ end }}}">
		{{{ if config.showSiteTitle }}}
		<div component="brand/wrapper" class="d-flex align-items-center justify-content-left align-content-stretch westgate-brand-hero__brand">
			<a component="siteTitle" class="text-truncate align-self-stretch align-items-center d-flex justify-content-left" href="{{{ if title:url }}}{title:url}{{{ else }}}{relative_path}/{{{ end }}}">
				<span class="westgate-brand-hero__title-block">
					<h1 class="fs-6 fw-bold text-body mb-0">{config.siteTitle}</h1>
					<span class="westgate-brand-hero__subtitle">Forums</span>
				</span>
			</a>
		</div>
		{{{ end }}}
		{{{ if widgets.brand-header.length }}}
		<div data-widget-area="brand-header" class="flex-fill gap-3 align-self-center westgate-brand-hero__widgets">
			{{{each widgets.brand-header}}}
			{{./html}}
			{{{end}}}
		</div>
		{{{ end }}}
	</div>
</div>
{{{ end }}} 
