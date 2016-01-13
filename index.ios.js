var frameModule = require("ui/frame");

var CustomMessageCompositeViewControllerDelegate = NSObject.extend({
    
    // Author: Иван Бухов
    // Author URL: https://github.com/ivanbuhov     
    // pass resolve and reject functions to the delegate instance and save them as instance properties
    
    initWithResolveReject: function(resolve, reject) {
        var self = this.super.init();
        if(self) {
            this.resolve = resolve;
            this.reject = reject;
        }
        return self;
    },

    messageComposeViewControllerDidFinishWithResult: function(controller, result) {
        
        controller.dismissModalViewControllerAnimated(true);
        
        console.log(result);

        if(result == MessageComposeResultCancelled) {
            console.log("Message Cancelled.");
            this.resolve({
                response: "canceled",
                message: "User cancelled the message."
            });
        }
        else if(result == MessageComposeResultSent) {
            console.log("Message Sent.");
            this.resolve({
                response: "sent",
                message: "Message sent."
            });
        }
        else {
            console.log("Something Failed.");
            this.reject(Error("Message send failed."));
        }

        // release the delegate instance
        CFRelease(controller.messageComposeDelegate);
    }
}, {
    protocols: [MFMessageComposeViewControllerDelegate]
});

function groupMessage(numbers, message, subject) {
    
    return new Promise(function (resolve, reject) {  
        
        if(MFMessageComposeViewController.canSendText()){
            var controller = MFMessageComposeViewController.alloc().init();
            if(controller != null){
                
                if(numbers){
                    controller.recipients = numbers;   
                }            
                if(message){
                    controller.body = message;   
                }           
                if(subject){
                    controller.subject = subject;   
                }                
                
                var delegate = CustomMessageCompositeViewControllerDelegate.alloc().initWithResolveReject(resolve, reject);
                // retain the delegate because messageComposeDelegate property won't do it for us
                CFRetain(delegate);
                controller.messageComposeDelegate = delegate;
                var page = frameModule.topmost().ios.controller;
                page.presentModalViewControllerAnimated(controller, true);     
                                
            }else{
                reject(Error("You're not able to send SMS messages. Please check device settings."));
            }             
        } else {
            reject(Error("You're not able to send SMS messages. Please check device settings.")); 
        } 
    
    });   
}

function singleMessage(number, message, subject){
    var sendNumber = [number];
    groupMessage(sendNumber, message, subject);
}

exports.groupMessage = groupMessage;
exports.singleMessage = singleMessage;
