/**
 * Chats' data
 */
let dialogs = [];

let setDialogs = data => {
    dialogs = data;
};

let getDialog = id => {
    return id ? dialogs[id] : Object.values(dialogs);
};

let addDialog = dialog => {
    dialogs.unshift(dialog);
};

let updateDialogs = message => {
    for (let i = 0; i < dialogs.length; i++) {
        const dialog = dialogs[i];

        if (dialog.id === message.dialog_id) {
            dialog.last_message = message.body;
            dialog.last_message_date_sent = message.date_sent;

            let updatedDialog = dialogs.splice(i, 1);
            dialogs.unshift(...updatedDialog);

            break;
        }
    }
};

exports.getDialog = getDialog;
exports.setDialogs = setDialogs;
exports.addDialog = addDialog;
exports.updateDialogs = updateDialogs;

/**
 * The current user data
 */
let currentUser = {};

let setCurrentUser = data => {
    Object.assign(currentUser, data);
};

let getCurrentUser = prop => {
    return prop ? currentUser[prop] : currentUser;
};

exports.setCurrentUser = setCurrentUser;
exports.getCurrentUser = getCurrentUser;

/**
 * Contacts' data
 */
let contacts = {};

let setContacts = data => {
    Object.assign(contacts, data);
};

let getContact = id => {
    return id ? contacts[id] : Object.values(contacts);
};

exports.setContacts = setContacts;
exports.getContact = getContact;
