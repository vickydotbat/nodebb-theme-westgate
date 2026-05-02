'use strict';

/*
	Hey there!

	This is the client file for your theme. If you need to do any client-side work in javascript,
	this is where it needs to go.

	You can listen for page changes by writing something like this:

	  $(window).on('action:ajaxify.end', function(ev, data) {
		var url = data.url;
		console.log('I am now at: ' + url);
	  });
*/

$(document).ready(function () {
	function normalizeAccountLinks() {
		const accountConfig = window.config && window.config.westgateAccount;
		const template = window.ajaxify && window.ajaxify.data && window.ajaxify.data.template;
		if (!accountConfig || (template && template.startsWith('admin/'))) {
			return;
		}

		const relativePath = window.config.relative_path || '';
		const replacements = {
			[`${relativePath}/register`]: accountConfig.registerUrl,
			'/register': accountConfig.registerUrl,
			[`${relativePath}/reset`]: accountConfig.recoveryUrl,
			'/reset': accountConfig.recoveryUrl,
		};

		document.querySelectorAll('a[href]').forEach((link) => {
			const original = link.getAttribute('href');
			if (!original || original.indexOf('local=1') !== -1) {
				return;
			}

			let parsed;
			try {
				parsed = new URL(original, window.location.origin);
			} catch (err) {
				return;
			}

			if (parsed.origin !== window.location.origin || parsed.search || parsed.hash) {
				return;
			}

			const replacement = replacements[parsed.pathname];
			if (replacement && replacement !== original) {
				link.setAttribute('href', replacement);
			}
		});
	}

	normalizeAccountLinks();
	$(window).on('action:ajaxify.end', normalizeAccountLinks);

	require(['api'], function (api) {
		const originalGet = api.get.bind(api);
		let categoryClassMapPromise;

		function getCategoryClassMap() {
			if (!categoryClassMapPromise) {
				categoryClassMapPromise = new Promise((resolve) => {
					originalGet('/categories', {}, function (err, data) {
						if (err || !data || !Array.isArray(data.categories)) {
							return resolve({});
						}

						const classMap = data.categories.reduce((memo, category) => {
							if (category && category.cid !== undefined) {
								memo[String(category.cid)] = category.class || '';
							}
							return memo;
						}, {});

						resolve(classMap);
					});
				});
			}

			return categoryClassMapPromise;
		}

		api.get = function (url, data, callback) {
			if (url !== '/search/categories' || typeof callback !== 'function') {
				return originalGet(url, data, callback);
			}

			return originalGet(url, data, function (err, payload) {
				if (err || !payload || !Array.isArray(payload.categories)) {
					return callback(err, payload);
				}

				getCategoryClassMap().then((classMap) => {
					payload.categories = payload.categories.map(category => ({
						...category,
						class: category.class || classMap[String(category.cid)] || '',
					}));
					callback(null, payload);
				});
			});
		};
	});
});
