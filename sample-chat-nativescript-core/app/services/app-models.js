const AppStorage = require('~/services/data-service');
const ConnectyCube = require('nativescript-connectycube');

function Dialog(dialog) {
    this.id = dialog._id;
    this.type = dialog.type;
    this.name = getName(dialog);
    this.photo = getDialogPhoto(dialog);
    this.room_jid = dialog.xmpp_room_jid;
    this.admins_ids = dialog.admins_ids;
    this.destination = dialog.xmpp_room_jid || dialog.room_jid;
    this.occupants_ids = dialog.occupants_ids;
    this.updated_date = getUpdatedDate(dialog);
    this.last_message_date_sent = getLastMessageDateSend(dialog);
    this.last_message = dialog.last_message;
    this.unread_messages_count = dialog.unread_messages_count;
    this.unread_messages_ids = dialog.unread_messages_ids;
    this.history = [];

    function getDialogPhoto(dialog) {
        if(dialog.photo){
            return ConnectyCube.storage.privateUrl(dialog.photo);
        } else if(dialog.type === 2){
            return '~/images/default_group_chat.png';
        } return '~/images/default_private_chat.png';
    }

    function getName(dialog) {
        return dialog.name ? dialog.name : dialog.type === 2 ? 'Unknown group chat' : 'Unknown private chat';
    }

    function getUpdatedDate(dialog) {
        const time = Math.floor(Date.now() / 1000);

        return Date.parse(dialog.updated_at) || dialog.room_updated_date || time;
    }

    function getLastMessageDateSend(dialog) {
        const time = Math.floor(Date.now() / 1000);

        return dialog.last_message_date_sent || time;
    }
}

function Message(msg) {
    this.id = getId(msg);
    this.body = getBody(msg);
    this.date_sent = getDate(msg);
    this.dialog_id = getDialogId(msg);
    this.attachment = getAttachment(msg);
    this.sender = getSender(msg);
    this.recipient_id = getRecipientId(msg);

    this.getSender = function(prop) {
        let contact = AppStorage.getContact(this.sender_id);

        return prop ? contact[prop] : contact;
    };

    function getId(msg) {
        return (msg.extension && msg.extension.message_id) || msg._id || msg.id || null;
    }

    function getBody(msg) {
        return msg.body || msg.message || '';
    }

    function getDate(msg) {
        return msg.date_sent || (msg.extension && msg.extension.date_sent) || null;
    }

    function getDialogId(msg) {
        return (msg.extension && msg.extension.dialog_id) || msg.chat_dialog_id;
    }

    function getAttachment(msg) {
        return (
            (msg.extension && msg.extension.attachments && msg.extension.attachments[0]) ||
            (msg.attachments && msg.attachments[0]) ||
            msg.attachment ||
            null
        );
    }

    function getSender(msg) {
        let id = msg.sender_id || (msg.extension && msg.extension.sender_id) || null;
        return AppStorage.getContact(id);
    }

    function getRecipientId(msg) {
        return msg.recipient_id || (msg.extension && msg.extension.recipient_id) || null;
    }
}

function User(data) {
    this.id = data.id;
    this.full_name = data.full_name || 'Unknown user';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.avatar = getUserPhoto(data.avatar);
    this.custom_data = data.custom_data || '';
    function getUserPhoto(avatar){
        if(avatar){
            return ConnectyCube.storage.privateUrl(avatar);
        } else {
            return '~/images/default_private_chat.png'
        }
    }
    
}

exports.Dialog = Dialog;
exports.Message = Message;
exports.User = User;
