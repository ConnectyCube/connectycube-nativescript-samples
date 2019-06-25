const fromObject = require('tns-core-modules/data/observable').fromObject;
const ObservableArray = require('tns-core-modules/data/observable-array').ObservableArray;
const SelectedPageService = require('~/services/selected-page-service');
const ChatService = require('~/services/chat-service');

function BrowseViewModel() {
    SelectedPageService.getInstance().updateSelectedPage('Contacts');

    const viewModel = fromObject({
        contacts: new ObservableArray(),
        selected: new ObservableArray(),
        isLoading: false,
        isVisible: false,
        isWarning: false,
        warningText: '',
        searchText: '',
        dialogName: '',

        update() {
            let selectedAmount = this.get('selected').length,
                visibility = selectedAmount > 0 ? true : false;

            this.set('isVisible', visibility);
        },

        create() {
            return new Promise((resolve, reject) => {
                let contacts = this.get('selected'),
                    type = contacts.length > 0 ? (contacts.length > 1 ? 2 : 3) : null,
                    name = this.get('dialogName'),
                    params = {};

                if (type !== 3 && name.length < 1) {
                    alert(`Dialog's name doesn't match.`);
                    return;
                }

                params.type = type;
                params.occupants_ids = contacts.map(item => item.id);
                params.name = name;

                ChatService.createConversation(params)
                    .then(resolve)
                    .catch(reject);
            });
        }
    });

    return viewModel;
}

module.exports = BrowseViewModel;
