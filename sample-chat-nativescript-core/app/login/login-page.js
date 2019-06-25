const platform = require('tns-core-modules/platform');
const LoginViewModel = require('./login-view-model');

let loginVM = new LoginViewModel();

exports.pageLoaded = args => {
    const page = args.object;
    page.bindingContext = loginVM;

    if (platform.isIOS) {
        IQKeyboardManager.sharedManager().enable = true;
        IQKeyboardManager.sharedManager().enableAutoToolbar = true;
    }
};
