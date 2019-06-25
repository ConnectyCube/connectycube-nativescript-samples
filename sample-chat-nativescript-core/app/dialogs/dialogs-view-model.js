const topmost = require('tns-core-modules/ui/frame').topmost;
const observableModule = require('tns-core-modules/data/observable');
const SelectedPageService = require('../services/selected-page-service');

function DialogsViewModel() {
    SelectedPageService.getInstance().updateSelectedPage('Dialogs');

    const viewModel = observableModule.fromObject({
        isLoading: true,

        update(message) {
            let dialogs = this.get('dialogs');

            for (let i = 0; i < dialogs.length; i++) {
                const dialog = dialogs.getItem(i);

                if (dialog.id === message.dialog_id) {
                    dialog.last_message = message.body;
                    dialog.last_message_date_sent = message.date_sent;
                    let updatedDialog = dialogs.splice(i, 1);
                    dialogs.unshift(...updatedDialog);
                    break;
                }
            }
        },

        createChat() {
            topmost().navigate({
                moduleName: 'contacts/contacts-page',
                transition: {
                    name: 'slideRight',
                    duration: 300
                }
            });
        }
    });

    return viewModel;
}

module.exports = DialogsViewModel;
