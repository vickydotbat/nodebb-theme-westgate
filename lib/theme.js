'use strict';

const nconf = require.main.require('nconf');
const meta = require.main.require('./src/meta');
const _ = require.main.require('lodash');
const user = require.main.require('./src/user');

const controllers = require('./controllers');

const library = module.exports;

const defaults = {
	enableQuickReply: 'on',
	enableBreadcrumbs: 'on',
	centerHeaderElements: 'off',
	mobileTopicTeasers: 'off',
	stickyToolbar: 'on',
	autohideBottombar: 'on',
	openSidebars: 'off',
	chatModals: 'off',
};

const accountUrlEnv = {
	loginUrl: 'WESTGATE_ACCOUNT_LOGIN_URL',
	registerUrl: 'WESTGATE_ACCOUNT_REGISTER_URL',
	recoveryUrl: 'WESTGATE_ACCOUNT_RECOVERY_URL',
	manageUrl: 'WESTGATE_ACCOUNT_MANAGE_URL',
	passwordUrl: 'WESTGATE_ACCOUNT_PASSWORD_URL',
	mfaUrl: 'WESTGATE_ACCOUNT_MFA_URL',
	sessionsUrl: 'WESTGATE_ACCOUNT_SESSIONS_URL',
	localLoginUrl: 'WESTGATE_ACCOUNT_LOCAL_LOGIN_URL',
};

const authentikUrlEnv = {
	registerUrl: 'WESTGATE_AUTHENTIK_REGISTER_URL',
	recoveryUrl: 'WESTGATE_AUTHENTIK_RECOVERY_URL',
	manageUrl: 'WESTGATE_AUTHENTIK_USER_SETTINGS_URL',
	passwordUrl: 'WESTGATE_AUTHENTIK_PASSWORD_URL',
	mfaUrl: 'WESTGATE_AUTHENTIK_MFA_URL',
	sessionsUrl: 'WESTGATE_AUTHENTIK_SESSIONS_URL',
};

library.init = async function (params) {
	const { router, middleware } = params;
	const routeHelpers = require.main.require('./src/routes/helpers');

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/theme-quickstart', [], controllers.renderAdminPage);

	routeHelpers.setupPageRoute(router, '/user/:userslug/theme', [
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	], controllers.renderThemeSettings);

	if (nconf.get('isPrimary') && process.env.NODE_ENV === 'production') {
		setTimeout(buildSkins, 0);
	}
};

async function buildSkins() {
	try {
		const plugins = require.main.require('./src/plugins');
		await plugins.prepareForBuild(['client side styles']);
		for (const skin of meta.css.supportedSkins) {
			// eslint-disable-next-line no-await-in-loop
			await meta.css.buildBundle(`client-${skin}`, true);
		}
		require.main.require('./src/meta/minifier').killAll();
	} catch (err) {
		console.error(err.stack);
	}
}

library.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/theme-quickstart',
		icon: 'fa-paint-brush',
		name: 'Theme Quick Start',
	});
	return header;
};

library.addProfileItem = async (data) => {
	data.links.push({
		id: 'westgate-account',
		route: 'edit',
		icon: 'fa-user-shield',
		name: 'Manage Westgate Account',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	data.links.push({
		id: 'westgate-account-password',
		route: 'edit/password',
		icon: 'fa-key',
		name: 'Change Password',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	data.links.push({
		id: 'westgate-account-mfa',
		route: 'settings',
		icon: 'fa-lock',
		name: 'Two-Factor Authentication',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	data.links.push({
		id: 'westgate-account-recovery',
		route: 'edit/password',
		icon: 'fa-life-ring',
		name: 'Recovery Options',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	data.links.push({
		id: 'theme',
		route: 'theme',
		icon: 'fa-paint-brush',
		name: '[[themes/harmony:settings.title]]',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	return data;
};

library.defineWidgetAreas = async function (areas) {
	const locations = ['header', 'sidebar', 'footer'];
	const templates = [
		'categories.tpl', 'category.tpl', 'topic.tpl', 'users.tpl',
		'unread.tpl', 'recent.tpl', 'popular.tpl', 'top.tpl', 'tags.tpl', 'tag.tpl',
		'login.tpl', 'register.tpl',
	];
	function capitalizeFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	templates.forEach((template) => {
		locations.forEach((location) => {
			areas.push({
				name: `${capitalizeFirst(template.split('.')[0])} ${capitalizeFirst(location)}`,
				template: template,
				location: location,
			});
		});
	});

	areas = areas.concat([
		{
			name: 'Main post header',
			template: 'topic.tpl',
			location: 'mainpost-header',
		},
		{
			name: 'Main post footer',
			template: 'topic.tpl',
			location: 'mainpost-footer',
		},
		{
			name: 'Sidebar Footer',
			template: 'global',
			location: 'sidebar-footer',
		},
		{
			name: 'Brand Header',
			template: 'global',
			location: 'brand-header',
		},
		{
			name: 'About me (before)',
			template: 'account/profile.tpl',
			location: 'profile-aboutme-before',
		},
		{
			name: 'About me (after)',
			template: 'account/profile.tpl',
			location: 'profile-aboutme-after',
		},
	]);

	return areas;
};

library.loadThemeConfig = async function (uid) {
	const [themeConfig, userConfig] = await Promise.all([
		meta.settings.get('harmony'),
		user.getSettings(uid),
	]);

	const config = { ...defaults, ...themeConfig, ...(_.pick(userConfig, Object.keys(defaults))) };
	config.enableQuickReply = config.enableQuickReply === 'on';
	config.enableBreadcrumbs = config.enableBreadcrumbs === 'on';
	config.centerHeaderElements = config.centerHeaderElements === 'on';
	config.mobileTopicTeasers = config.mobileTopicTeasers === 'on';
	config.stickyToolbar = config.stickyToolbar === 'on';
	config.autohideBottombar = config.autohideBottombar === 'on';
	config.openSidebars = config.openSidebars === 'on';
	config.chatModals = config.chatModals === 'on';
	return config;
};

library.getThemeConfig = async function (config) {
	config.theme = await library.loadThemeConfig(config.uid);
	config.westgateAccount = getWestgateAccountConfig(config);
	config.openDraftsOnPageLoad = false;
	return config;
};

function getWestgateAccountConfig(config) {
	const relativePath = config.relative_path || nconf.get('relative_path') || '';
	const local = {
		loginUrl: withRelativePath(relativePath, '/login'),
		registerUrl: withRelativePath(relativePath, '/register'),
		recoveryUrl: withRelativePath(relativePath, '/reset'),
		manageUrl: withRelativePath(relativePath, '/me/settings'),
		passwordUrl: withRelativePath(relativePath, '/reset'),
		mfaUrl: withRelativePath(relativePath, '/me/settings'),
		sessionsUrl: withRelativePath(relativePath, '/me/sessions'),
		localLoginUrl: withRelativePath(relativePath, '/login?local=1'),
	};

	const authentik = Object.fromEntries(Object.entries(authentikUrlEnv).map(([key, envName]) => (
		[key, normalizeConfiguredUrl(process.env[envName], relativePath)]
	)));

	const accountConfig = Object.fromEntries(Object.entries(accountUrlEnv).map(([key, envName]) => {
		const configuredUrl = normalizeConfiguredUrl(process.env[envName], relativePath);
		return [key, configuredUrl || authentik[key] || local[key]];
	}));

	accountConfig.registerActionUrl = authentik.registerUrl ||
		(accountConfig.registerUrl !== local.registerUrl ? accountConfig.registerUrl : accountConfig.loginUrl);
	accountConfig.recoveryActionUrl = authentik.recoveryUrl ||
		(accountConfig.recoveryUrl !== local.recoveryUrl ? accountConfig.recoveryUrl : accountConfig.loginUrl);
	accountConfig.passwordActionUrl = authentik.passwordUrl || authentik.recoveryUrl || accountConfig.recoveryUrl;
	accountConfig.mfaActionUrl = authentik.mfaUrl || accountConfig.mfaUrl;
	accountConfig.globalSessionsActionUrl = authentik.sessionsUrl || accountConfig.manageUrl;

	return accountConfig;
}

function normalizeConfiguredUrl(url, relativePath) {
	if (!url) {
		return '';
	}

	const trimmed = String(url).trim();
	if (!trimmed || /^javascript:/i.test(trimmed)) {
		return '';
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	if (trimmed.charAt(0) === '/') {
		return withRelativePath(relativePath, trimmed);
	}

	return '';
}

function withRelativePath(relativePath, path) {
	const base = relativePath || '';
	return `${base}${path}`;
}

library.getAdminSettings = async function (hookData) {
	if (hookData.plugin === 'harmony') {
		hookData.values = {
			...defaults,
			...hookData.values,
		};
	}
	return hookData;
};

library.saveUserSettings = async function (hookData) {
	Object.keys(defaults).forEach((key) => {
		if (hookData.data.hasOwnProperty(key)) {
			hookData.settings[key] = hookData.data[key] || undefined;
		}
	});
	return hookData;
};

library.filterMiddlewareRenderHeader = async function (hookData) {
	hookData.templateData.bootswatchSkinOptions = await meta.css.getSkinSwitcherOptions(hookData.req.uid);
	return hookData;
};
