const observableModule = require('tns-core-modules/data/observable');
const SelectedPageService = require('~/services/selected-page-service');
const ChatService = require('~/services/chat-service');
const AppStorage = require('~/services/data-service');

function ChatViewModel() {
    SelectedPageService.getInstance().updateSelectedPage('Chat');

    const viewModel = observableModule.fromObjectRecursive({
        message: '',

        send() {
            if (!this.message.trim()) return;
            
            const typeDialog = this.get('xmpp_room_jid');

            const date = Math.floor(Date.now() / 1000)
            const recipient_id = 
                this.get('type') === 3 ? 
                this.get('occupants_ids').find(elem => elem != AppStorage.getCurrentUser('id')) : 
                typeDialog;

            const messageExtensions = {
              date_sent: date,
              save_to_history: 1,
              dialog_id: this.get('id'),
              sender_id: AppStorage.getCurrentUser('id'),
            };

            const msg = {
              type: !typeDialog ? 'chat' : 'groupchat',
              body: this.message.trim(),
              extension: messageExtensions,
            };

            console.warn('msg1', msg)

            // const to = this.get('destination');
            // const message = {
            //     type: this.get('type') === 3 ? 'chat' : 'groupchat',
            //     body: this.message.trim(),
            //     extension: {
            //         save_to_history: 1,
            //         dialog_id: this.get('id'),
            //         sender_id: AppStorage.getCurrentUser('id')
            //     },
            //     markable: 1
            // };

            if (msg.body) {
                // ChatService.sendMessage(recipient_id, message);
                ChatService.sendMessage(recipient_id, msg);
                this.message = '';
            }
        },

        drawMessage(message) {
            let historyArr = this.get('history');
            historyArr.push(message);
            this.scrollToBottom();
        },

        scrollToIndex(index) {
            setTimeout(() => {
                this.get('chatView').scrollToIndex(index);
            }, 10);
        },

        scrollToBottom() {
            this.scrollToIndex(this.get('history').length);
        }
    });

    return viewModel;
}

module.exports = ChatViewModel;
