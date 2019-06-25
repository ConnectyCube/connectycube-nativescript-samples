const topmost = require('tns-core-modules/ui/frame').topmost;
const observableModule = require('data/observable');
const dialogsModule = require('ui/dialogs');
const UserService = require('~/services/user-service');
const ChatService = require('~/services/chat-service');

function LoginViewModel() {
    let vm = observableModule.fromObject({
        email: '',
        fullName: '',
        password: '',
        isLoggingIn: true,

        toggleForm() {
            this.isLoggingIn = !this.isLoggingIn;
        },

        submit() {
            if (this.email.trim() === '' || this.password.trim() === '') {
                alert('Please provide an email address and password.');
                return;
            }

            if (this.isLoggingIn) {
                this.login();
            } else {
                this.register();
            }
        },

        login() {
            UserService.login({
                email: this.email,
                password: this.password
            }).then(user => {
                ChatService.start(user).then(dialogs => {
                    topmost().navigate({
                        moduleName: './dialogs/dialogs-page',
                        context: dialogs,
                        clearHistory: true,
                        transition: {
                            name: 'slideTop',
                            duration: 300
                        }
                    });
                });
            });
        },

        register() {
            if (!this.fullName) {
                alert('Enter your name.');
                return;
            }

            UserService.register({
                email: this.email,
                password: this.password,
                full_name: this.fullName
            })
                .then(() => {
                    this.isLoggingIn = true;
                    alert('Your account was successfully created. You can now login.');
                })
                .catch(() => alert('Unfortunately we were unable to create your account.'));
        },

        forgotPassword() {
            dialogsModule
                .prompt({
                    title: 'Forgot Password',
                    message: 'Enter the email address you used to register for the ConnectCube to reset your password.',
                    inputType: 'email',
                    defaultText: '',
                    okButtonText: 'Ok',
                    cancelButtonText: 'Cancel'
                })
                .then(data => {
                    if (data.result) {
                        UserService.resetPassword(data.text.trim())
                            .then(() => alert('Please check your email to continue.'))
                            .catch(() => alert('Unfortunately, an error occurred resetting your password.'));
                    }
                });
        }
    });

    return vm;
}

module.exports = LoginViewModel;
