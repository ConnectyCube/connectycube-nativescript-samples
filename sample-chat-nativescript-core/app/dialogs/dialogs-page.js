const app = require('tns-core-modules/application');
const platform = require('tns-core-modules/platform');
const topmost = require('tns-core-modules/ui/frame').topmost;
const observableArray = require('tns-core-modules/data/observable-array').ObservableArray;
const DialogsViewModel = require('./dialogs-view-model');
const AppStorage = require('~/services/data-service');
const KeyboardService = require('~/services/keyboard-service');

let dialogsVM = new DialogsViewModel();

function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = dialogsVM;
    _bindNavigationContext(page.navigationContext);

    if (platform.isIOS) {
        IQKeyboardManager.sharedManager().enable = false;
        IQKeyboardManager.sharedManager().enableAutoToolbar = false;

        KeyboardService.closeIOSKeyboard(page);
    }
}

function onItemTap(args) {
    const view = args.view;
    const context = view.bindingContext;

    topmost().navigate({
        moduleName: 'chat/chat-page',
        context: context,
        transition: {
            name: 'slideLeft',
            duration: 300
        }
    });
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function update(message) {
    dialogsVM.update(message);
    AppStorage.updateDialogs(message);
}

function _bindNavigationContext(context) {
    let dialogs = context ? context : AppStorage.getDialog(),
        isDialogs = dialogs && dialogs.length;

    dialogsVM.set('dialogs', new observableArray(dialogs));
    dialogsVM.set('isLoading', !isDialogs);
}

exports.onNavigatingTo = onNavigatingTo;
exports.onItemTap = onItemTap;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.update = update;
