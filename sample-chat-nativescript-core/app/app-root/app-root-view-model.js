const observableModule = require('tns-core-modules/data/observable');
const SelectedPageService = require('~/services/selected-page-service');

function AppRootViewModel() {
    const viewModel = observableModule.fromObject({
        selectedPage: '',
        user: {
            avatar: '',
            full_name: '',
            email: ''
        }
    });

    SelectedPageService.getInstance().selectedPage$.subscribe(selectedPage => {
        viewModel.selectedPage = selectedPage;
    });

    return viewModel;
}

module.exports = AppRootViewModel;
