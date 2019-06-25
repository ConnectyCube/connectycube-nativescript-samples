const app = require('tns-core-modules/application');
const topmost = require('tns-core-modules/ui/frame').topmost;
const AppRootViewModel = require('./app-root-view-model');
const UserService = require('~/services/user-service');
const ChatService = require('~/services/chat-service');

const onLoaded = args => {
    const drawerComponent = args.object;
    drawerComponent.bindingContext = new AppRootViewModel();

    UserService.autologin()
        .then(user => {
            ChatService.start(user).then(dialogs => {
                topmost().navigate({
                    moduleName: 'dialogs/dialogs-page',
                    context: dialogs,
                    clearHistory: true
                });
            });
        })
        .catch(() => {
            topmost().navigate({
                moduleName: 'login/login-page',
                clearHistory: true
            });
        });
};

const onNavigationItemTap = args => {
    const component = args.object;
    const componentRoute = component.route;
    const componentTitle = component.title;
    const bindingContext = component.bindingContext;

    bindingContext.set('selectedPage', componentTitle);

    topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: 'slideRight',
            duration: 300
        }
    });

    const drawerComponent = app.getRootView();
    drawerComponent.closeDrawer();
};

let onLogout = () => {
    UserService.logout();

    topmost().navigate({
        moduleName: './login/login-page',
        clearHistory: true,
        transition: {
            name: 'slideTop',
            duration: 300
        }
    });

    const drawerComponent = app.getRootView();
    drawerComponent.closeDrawer();
};

exports.onLoaded = onLoaded;
exports.onNavigationItemTap = onNavigationItemTap;
exports.onLogout = onLogout;
