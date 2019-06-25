const platform = require('tns-core-modules/platform');
const topmost = require('tns-core-modules/ui/frame').topmost;
const observableArray = require('tns-core-modules/data/observable-array').ObservableArray;
const ChatViewModel = require('./chat-view-model');
const ChatService = require('~/services/chat-service');
const KeyboardService = require('~/services/keyboard-service');

let chatVM = new ChatViewModel();

function onLoaded(args) {
    const page = args.object;
    
    if (platform.isAndroid) {
        KeyboardService.addOnAndroidKeyboardListener(page, _adaptFrame);
    } else if (platform.isIOS) {
        KeyboardService.addOnIOSKeyboardListener(_adaptFrame);
    }
}

function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = chatVM;
    _bindNavigationContext(page);
}

function onBackButtonTap() {
    topmost().goBack();
}

function pressSend() {
    chatVM.send();
    KeyboardService.closeIOSKeyboard();
}

function drawMessage(msg) {
    chatVM.drawMessage(msg);
}

function _bindNavigationContext(page) {
    const context = page.navigationContext;

    if (!context) return;

    for (let key in context) {
        chatVM.set(key, context[key]);
    }

    chatVM.set('chatView', page.getViewById('chatHistory'));

    ChatService.getChatHistory(chatVM.get('id')).then(history => {
        chatVM.set('history', new observableArray(history));
        chatVM.scrollToBottom();
    });
}

function _adaptFrame(size) {
    if (size > 150) chatVM.scrollToBottom();
}

exports.onLoaded = onLoaded;
exports.onNavigatingTo = onNavigatingTo;
exports.onBackButtonTap = onBackButtonTap;
exports.pressSend = pressSend;
exports.drawMessage = drawMessage;
