const ConnectyCube = require('connectycube');
const ChatPage = require('../chat/chat-page');
const DialogsPage = require('../dialogs/dialogs-page');
const UserService = require('./user-service');
const AppStorage = require('./data-service');
const Dialog = require('./app-models.js').Dialog;
const Message = require('./app-models.js').Message;

// Chat - Core
function connect(user) {
    return new Promise((resolve, reject) => {
        ConnectyCube.chat.connect(
            {
                userId: user.id,
                password: user.password
            },
            (error, contacts) => {
                if (!error && contacts) {
                    _joinToDialogs();
                    _setupChatListeners();
                    resolve(contacts);
                } else {
                    reject(error);
                }
            }
        );
    });
}

function start(user) {
    return new Promise((resolve, reject) => {
        getConversations()
            .then(dialogs => {
                connect(user);
                resolve(dialogs);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function disonnect() {
    ConnectyCube.chat.disconnect();
}

function sendMessage(to, message) {
    ConnectyCube.chat.send(to, message);

    _showMessage(message);
}

function _setupChatListeners() {
    ConnectyCube.chat.onMessageListener = onMessageListener;
}

function onMessageListener(id, message) {
    if (id === AppStorage.getCurrentUser('id')) {
        return;
    }

    _showMessage(message);
}

function _showMessage(msg) {
    let message = new Message(msg);

    ChatPage.drawMessage(message);
    DialogsPage.update(message);
}

// Chat - Dialogs
function getConversations() {
    return new Promise((resolve, reject) => {
        ConnectyCube.chat.dialog.list({ sort_desc: 'last_message_date_sent' }, (error, result) => {
            if (!error && result) {
                const items = result.items;

                let dialogs = [],
                    contactsIds = [];

                for (let i = 0; i < items.length; i++) {
                    if (items[i].type === 1) continue;

                    let dialog = new Dialog(items[i]);

                    if (dialog.type === 3) {
                        dialog.destination = ConnectyCube.chat.helpers.getRecipientId(
                            dialog.occupants_ids,
                            AppStorage.getCurrentUser('id')
                        );
                    } else {
                        dialog.destination = dialog.room_jid;
                    }

                    contactsIds = [...new Set(contactsIds.concat(dialog.occupants_ids))];
                    dialogs.push(dialog);
                }

                UserService.listUsersByIds(contactsIds);
                AppStorage.setDialogs(dialogs);

                resolve(dialogs);
            } else {
                reject(error);
            }
        });
    });
}

function createConversation(params) {
    return new Promise((resolve, reject) => {
        ConnectyCube.chat.dialog.create(params, (error, conversation) => {
            if (!error && conversation) {
                let dialog = new Dialog(conversation);

                if (dialog.type === 3) {
                    dialog.destination = ConnectyCube.chat.helpers.getRecipientId(
                        dialog.occupants_ids,
                        AppStorage.getCurrentUser('id')
                    );
                } else {
                    ConnectyCube.chat.muc.join(dialog.room_jid);
                    dialog.destination = dialog.room_jid;
                }

                AppStorage.addDialog(dialog);

                resolve(dialog);
            } else {
                reject(error);
            }
        });
    });
}

function _joinToDialogs() {
    let dialogs = AppStorage.getDialog();

    for (let i = 0; i < dialogs.length; i++) {
        let dialog = dialogs[i];

        if (dialog.type !== 3) {
            ConnectyCube.chat.muc.join(dialog.room_jid);
        }
    }
}

// Chat - Messages
function getChatHistory(dialogId) {
    return new Promise((resolve, reject) => {
        ConnectyCube.chat.message.list({ chat_dialog_id: dialogId, sort_desc: 'date_sent' }, (error, result) => {
            if (!error && result) {
                const messages = result.items;
                let history = [];

                for (let i = 0; i < messages.length; i++) {
                    history.push(new Message(messages[i]));
                }

                resolve(history.reverse());
            } else {
                reject(error);
            }
        });
    });
}

exports.start = start;
exports.disonnect = disonnect;
exports.sendMessage = sendMessage;
exports.onMessageListener = onMessageListener;

exports.getConversations = getConversations;
exports.createConversation = createConversation;

exports.getChatHistory = getChatHistory;
