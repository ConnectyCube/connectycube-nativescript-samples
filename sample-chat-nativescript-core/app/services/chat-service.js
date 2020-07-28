const ConnectyCube = require('nativescript-connectycube');
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
    ConnectyCube.chat.send(recipient_id, message);
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

async function getConversations() {
    const result = await ConnectyCube.chat.dialog.list({ sort_desc: 'last_message_date_sent' });
        if (result) {
            const items = result.items;
            let dialogs = [],
                contactsIds = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type === 1) continue;
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

async function createConversation(params) {
    return ConnectyCube.chat.dialog.create(params).then(conversation => {
        if(conversation){
            let dialog = new Dialog(conversation);
            AppStorage.addDialog(dialog); 
        } else {
            return conversation
        }
    })
}

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
