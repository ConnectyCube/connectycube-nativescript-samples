const platform = require('tns-core-modules/platform');
const topmost = require('tns-core-modules/ui/frame').topmost;

let screenResizeListener,
    androidPage,
    iOSKeyboardHolder;

function addOnAndroidKeyboardListener(page, callback) {
    const screen = platform.screen;
    const sizeIndex = screen.mainScreen.heightDIPs / screen.mainScreen.heightPixels;

    let navbarHeight = 0;
    let keyboardHeight = 0;
    let lastKeyboardHeight = 0;
    
    androidPage = page.android;
    
    if (screenResizeListener && androidPage) {
        androidPage.getViewTreeObserver().removeOnGlobalLayoutListener(screenResizeListener);
    }
    
    screenResizeListener = new android.view.ViewTreeObserver.OnGlobalLayoutListener({
        onGlobalLayout: function() {
            const rect = new android.graphics.Rect();
            
            androidPage.getWindowVisibleDisplayFrame(rect);
            
            let screenHeight = androidPage.getRootView().getHeight(),
            missingSize = screenHeight - rect.bottom;
            
            if (missingSize > screenHeight * 0.15) {
                keyboardHeight = (missingSize - navbarHeight) * sizeIndex;
            } else {
                navbarHeight = missingSize;
                keyboardHeight = 0;
            }
            
            if (lastKeyboardHeight !== keyboardHeight) {
                lastKeyboardHeight = keyboardHeight;
                topmost().currentPage.marginBottom = lastKeyboardHeight;

                if (typeof callback === 'function') {
                    callback(keyboardHeight);
                }
            }
        }
    });
    
    androidPage.getViewTreeObserver().addOnGlobalLayoutListener(screenResizeListener);
}

function addOnIOSKeyboardListener(callback) {
    KWKeyboardListener
        .sharedInstance()
        .addKeyboardEventsListenerWithHandler(
            UIApplication.sharedApplication.keyWindow,
            keyboard => {
                const page = topmost().currentPage;

                if (page.actionBarHidden || iOSKeyboardHolder) return;

                let size = keyboard.size.height,
                    keyboardHeight;

                if (size < 150) {
                    keyboardHeight = 0
                } else if (size > 301) {
                    keyboardHeight = size - 33;
                } else {
                    keyboardHeight = size;
                }

                page.marginBottom = keyboardHeight;

                if (typeof callback === 'function') {
                    callback(keyboardHeight);
                }
            }
        );
}

function closeIOSKeyboard(page) {
    iOSKeyboardHolder = true;
    
    setTimeout(() => {
        iOSKeyboardHolder = false;
    }, 1000);

    if (page) {
        page.marginBottom = 0;
    } else {
        topmost().currentPage.marginBottom = 0;
    }
}

exports.addOnAndroidKeyboardListener = addOnAndroidKeyboardListener;
exports.addOnIOSKeyboardListener = addOnIOSKeyboardListener;
exports.closeIOSKeyboard = closeIOSKeyboard;
