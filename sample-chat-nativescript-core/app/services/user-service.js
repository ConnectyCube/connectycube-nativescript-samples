const app = require('tns-core-modules/application');
const appSettings = require('application-settings');
const ConnectyCube = require('nativescript-connectycube');
const AppStorage = require('./data-service');
const User = require('./app-models.js').User;

function createSession() {
	return ConnectyCube.createSession();
}

async function login(loginParams) {
	const session = await ConnectyCube.createSession(loginParams);
	let user = null
	if(session){
		user = session.user;
		user.password = loginParams.password;
		setCurrentUser(user);
	} else {
		alert('Unfortunately we could not find your account.');
	}
	return user	
}

function logout() {
	ConnectyCube.chat.disconnect();
	ConnectyCube.logout();
	appSettings.clear();
}

async function register(signupParams) {
	await createSession();
	ConnectyCube.users.signup(signupParams)
}

function resetPassword(email) {
	return ConnectyCube.users.resetPassword(email)
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
				.then(user => {
					resolve(user)
				})
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

async function listUsers(params) {
	const result = await ConnectyCube.users.get(params);

	if(result.items.length){
		const users = result.items;
		let conatacts = {};
		users.forEach(elem => {
			conatacts[elem.user.id] = new User(elem.user);
		});
			AppStorage.setContacts(conatacts);
			return conatacts
	} else {
		return result
	}
}

async function listUsersByIds(ids) {
	const filter = {
		per_page: 100,
		filter: {
			field: 'id',
			param: 'in',
			value: ids
		}
	};
	return listUsers(filter);
}

function listUsersByFullName(name) {
	const filter = { 
		per_page: 100, 
		full_name: name 
	};
	return listUsers(filter);
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
