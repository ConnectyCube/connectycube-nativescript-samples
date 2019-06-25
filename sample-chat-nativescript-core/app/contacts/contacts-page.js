const platform = require('tns-core-modules/platform');
const Observable = require('tns-core-modules/data/observable').Observable;
const topmost = require('tns-core-modules/ui/frame').topmost;
const ContactsViewModel = require('./contacts-view-model');
const UserService = require('~/services/user-service');
const KeyboardService = require('~/services/keyboard-service');

let contactsVM = new ContactsViewModel();
let timer;

function onLoaded(args) {
    const page = args.object;
    
    if (platform.isAndroid) {
        KeyboardService.addOnAndroidKeyboardListener(page);
    } else if (platform.isIOS) {
        KeyboardService.addOnIOSKeyboardListener();
    }
}

function onNavigatingTo(args) {
    const page = args.object;
    contactsPage = page;
    page.bindingContext = contactsVM;
    _clearContext();
    _updateContext();
}

function onNavigatingFrom() {
    _clearContext();
}

function onBackButtonTap() {
    topmost().goBack();
}

function onCreateButtonTap() {
    contactsVM.create().then(dialog => {
        topmost().navigate({
            moduleName: 'chat/chat-page',
            context: dialog,
            transition: {
                name: 'slideLeft',
                duration: 300
            }
        });
    });
}

function select(args) {
    let selected = contactsVM.get('selected'),
        contacts = contactsVM.get('contacts');

    const index = args.index;
    const item = contacts.splice(index, 1)[0];

    selected.push(item);
    contactsVM.set('dialogName', selected.map(user => user.full_name).join(', '));
}

function unselect(args) {
    let selected = contactsVM.get('selected'),
        contacts = contactsVM.get('contacts');

    const index = selected.indexOf(args.view.bindingContext);
    const item = selected.splice(index, 1)[0];

    contacts.push(item);
    contactsVM.set('dialogName', selected.map(user => user.full_name).join(', '));
    contactsVM.set('isWarning', false);
}

function _clearContext() {
    clearTimeout(timer);
    contactsVM.set('isLoading', false);
    contactsVM.set('isWarning', false);
    contactsVM.set('isVisible', false);
    contactsVM.set('warningText', '');
    contactsVM.set('searchText', '');
    contactsVM.set('dialogName', '');
    contactsVM.get('selected').length = 0;
    contactsVM.get('contacts').length = 0;
}

function _updateContext() {
    contactsVM.addEventListener(Observable.propertyChangeEvent, args => {
        const value = args.value;
        const isSearch = args.propertyName === 'searchText';

        if (isSearch) {
            clearTimeout(timer);
            contactsVM.set('isWarning', false);
            contactsVM.set('isLoading', true);
            timer = setTimeout(() => {
                _findUsers(value);
            }, 1000);
        }
    });

    contactsVM.get('selected').addEventListener(Observable.propertyChangeEvent, () => {
        contactsVM.update();
    });
}

function search() {
    clearTimeout(timer);
    _findUsers(contactsVM.get('searchText'));
}

function pressSearch() {
    search();
    KeyboardService.closeIOSKeyboard();  
}

function _findUsers(value) {
    if (value.length > 2) {
        UserService.listUsersByFullName(value)
            .then(_updateUsersList)
            .catch(() => _updateUsersList('No results found'));
    } else {
        _updateUsersList('Name must be more than 2 characters');
    }

    contactsVM.set('isLoading', false);
}

function _updateUsersList(data) {
    let selected = contactsVM.get('selected'),
        contacts = contactsVM.get('contacts'),
        text = typeof data === 'string' ? data : false,
        dataArr = text ? [] : Object.values(data),
        users = [];

    for (let i = 0; i < dataArr.length; i++) {
        const user = dataArr[i];

        if (selected.some(contact => contact.id === user.id)) {
            continue;
        }

        users.push(user);
    }

    contacts.splice(0, contacts.length, ...users);

    if (text) {
        contactsVM.set('warningText', text);
        contactsVM.set('isWarning', true);
    }
}

exports.search = search;
exports.select = select;
exports.unselect = unselect;
exports.pressSearch = pressSearch;
exports.onLoaded = onLoaded;
exports.onNavigatingTo = onNavigatingTo;
exports.onNavigatingFrom = onNavigatingFrom;
exports.onBackButtonTap = onBackButtonTap;
exports.onCreateButtonTap = onCreateButtonTap;
