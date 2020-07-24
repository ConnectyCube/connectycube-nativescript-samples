const ConnectyCube = require('connectycube');
const ChatPage = require('../chat/chat-page');
const DialogsPage = require('../dialogs/dialogs-page');
const UserService = require('./user-service');
const AppStorage = require('./data-service');
const Dialog = require('./app-models.js').Dialog;
const Message = require('./app-models.js').Message;

// Chat - Core
async function connect(user) {
    const contactList = await ConnectyCube.chat.connect({
        userId: user.id,
        password: user.password
    });
    _setupChatListeners();
    return contactList
}

async function start(user) {
    const dialogs = await getConversations();
    await connect(user);
    return dialogs;
}

function disonnect() {
    ConnectyCube.chat.disconnect();
}

async function sendMessage(recipient_id, message) {
    console.warn('sendMessage123', recipient_id, message)

    // message.id = ConnectyCube.chat.send(opponentId, message)

    const resSend = await ConnectyCube.chat.send(recipient_id, message);
    _showMessage(message);
    
    console.warn('resSend', resSend)
    
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

async function getConversations() {
    const result = await ConnectyCube.chat.dialog.list({ sort_desc: 'last_message_date_sent' });
        if (result) {
            const items = result.items;
            let dialogs = [],
                contactsIds = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type === 1) continue;
                console.warn('curr-t', items[i])
                let dialog = new Dialog(items[i]);
                AppStorage.getCurrentUser('id')
                contactsIds = [...new Set(contactsIds.concat(dialog.occupants_ids))];
                dialogs.push(dialog);
            }

            UserService.listUsersByIds(contactsIds);
            AppStorage.setDialogs(dialogs);
            
            return (dialogs);
        } 
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

// function _joinToDialogs() {
//     let dialogs = AppStorage.getDialog();

//     for (let i = 0; i < dialogs.length; i++) {
//         let dialog = dialogs[i];

//         if (dialog.type !== 3) {
//             ConnectyCube.chat.muc.join(dialog.room_jid);
//         }
//     }
// }

// Chat - Messages
async function getChatHistory(dialogId) {
    const fetchMessages = await ConnectyCube.chat.message.list({ chat_dialog_id: dialogId, sort_desc: 'date_sent' });  
    const messages = fetchMessages.items.map(elem => {
        return new Message(elem)
    })
    return messages.reverse()
}

exports.start = start;
exports.disonnect = disonnect;
exports.sendMessage = sendMessage;
exports.onMessageListener = onMessageListener;

exports.getConversations = getConversations;
exports.createConversation = createConversation;

exports.getChatHistory = getChatHistory;
