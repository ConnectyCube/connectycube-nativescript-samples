const app = require('tns-core-modules/application');
const appSettings = require('application-settings');
const ConnectyCube = require('connectycube');
const AppStorage = require('./data-service');
const User = require('./app-models.js').User;

function createSession() {
	return new Promise((resolve, reject) => {
		ConnectyCube.createSession((err, res) => {
			res ? resolve(res) : reject(err);
		});
	});
}

function login(loginParams) {
	return new Promise((resolve, reject) => {
		ConnectyCube.createSession(loginParams, (error, session) => {
			if (session && !error) {
				let user = session.user;

				user.password = loginParams.password;
				setCurrentUser(user);
				resolve(user);
			} else {
				alert('Unfortunately we could not find your account.');
				reject(error);
			}
		});
	});
}

function logout() {
	ConnectyCube.chat.disconnect();
	ConnectyCube.logout();
	appSettings.clear();
}

function register(signupParams) {
	return new Promise((resolve, reject) => {
		createSession()
			.then(() => {
				ConnectyCube.users.signup(signupParams, (error, user) => {
					error ? reject(error) : resolve(user);
				});
			})
			.catch(e => reject(e));
	});
}

function resetPassword(email) {
	return new Promise((resolve, reject) => {
		ConnectyCube.users.resetPassword(email, error => {
			error ? reject(error) : resolve();
		});
	});
}

function setCurrentUser(data) {
	const sideDrawer = app.getRootView();
	const user = new User(data);

	sideDrawer.bindingContext.user = user;
	appSettings.setString('authParams', JSON.stringify(data));
	AppStorage.setCurrentUser(user);
	AppStorage.setContacts({ [user.id]: user });
}

function getCurrentUser() {
	let data = appSettings.getString('authParams');

	return data ? JSON.parse(data) : '';
}

function autologin() {
	return new Promise((resolve, reject) => {
		let data = getCurrentUser();

		if (data) {
			login({
				email: data.email,
				password: data.password
			})
				.then(user => resolve(user))
				.catch(() => reject());
		} else {
			reject();
		}
	});
}

function getUserById(id) {
	return new Promise((resolve, reject) => {
		ConnectyCube.users.get(id, (error, user) => {
			if (!error && user) {
				AppStorage.setContacts({ [user.id]: user });
				resolve(user);
			} else {
				reject(error);
			}
		});
	});
}

function listUsers(params) {
	return new Promise((resolve, reject) => {
		ConnectyCube.users.get(params, (error, result) => {
			if (!error && result) {
				const users = result.items;
				let conatcts = {};

				for (let i = 0; i < users.length; i++) {
					let user = users[i].user;
					conatcts[user.id] = new User(user);
				}

				AppStorage.setContacts(conatcts);

				resolve(conatcts);
			} else {
				reject(error);
			}
		});
	});
}

function listUsersByIds(ids) {
	return new Promise((resolve, reject) => {
		listUsers({
			per_page: 100,
			filter: {
				field: 'id',
				param: 'in',
				value: ids
			}
		})
			.then(users => resolve(users))
			.catch(error => reject(error));
	});
}

function listUsersByFullName(name) {
	return new Promise((resolve, reject) => {
		listUsers({ per_page: 100, full_name: name })
			.then(users => resolve(users))
			.catch(error => reject(error));
	});
}

exports.login = login;
exports.logout = logout;
exports.register = register;
exports.autologin = autologin;
exports.resetPassword = resetPassword;
exports.getCurrentUser = getCurrentUser;
exports.getUserById = getUserById;
exports.listUsersByIds = listUsersByIds;
exports.listUsersByFullName = listUsersByFullName;
