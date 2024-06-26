# Chat code sample for NativeScript for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Chat code sample for NativeScript

Project contains the following features implemented:

* User authorization
* Chat dialogs creation
* 1-1 messaging
* Group messaging
* Users search

ConnectyCube NativeScript getting started - https://developers.connectycube.com/nativescript

ConnectyCube Chat API documentation - https://developers.connectycube.com/nativescript/messaging

## Screenshots

<kbd><img alt="Chat code sample for NativeScript - dialogs list" src="https://developers.connectycube.com/images/code_samples/nativescript_codesample_chat_dialogs_list.png" width="200" /></kbd> <kbd><img alt="Chat code sample for NativeScript - chat history" src="https://developers.connectycube.com/images/code_samples/nativescript_codesample_chat_chat_history.png" width="200" /></kbd> <kbd><img alt="Chat code sample for NativeScript - menu" src="https://developers.connectycube.com/images/code_samples/nativescript_codesample_chat_menu.png" width="200" /></kbd>

## Roadmap

The following features will be addressed in future:

* Sent/Delivered/Read statuses
* ‘Is typing’ statuses
* File attachments
* Group chat info
* Group chat: add/remove participants
* Delete chat functionality
* Edit messages
* Delete messages

## How to build

1. [Setup {N}](https://docs.nativescript.org/start/quick-setup/) 
2. open sample-chat-nativescript-core root of this folder
3. npm install
4. open node_modules/pbkdf2/lib/default_encoding.js and replace with:
   ```
   var defaultEncoding
    if (!global.process) {
     Object.assign(global, {
         process: {
             browser: false,
             env: {},
             version: "10.16.3"
         }
     });
    }
    if (process.browser) {
     defaultEncoding = 'utf-8'
    } else {
     var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10)
     defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary'
    }
    module.exports = defaultEncoding
   ```
5. `tns run ios` or `tns run android` from the root of this folder.

## Can't build yourself?

Got troubles with building NativeScript code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-nativescript-samples/issues) - we will create the sample for you. For FREE!
