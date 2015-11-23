var Resource = require('deployd/lib/resource');
var util     = require('util');
var apn      = require('apn');

function dpdapn(options){

    Resource.apply(this, arguments);

    var options = {
        "cert":       this.config.cert,
        "key":        this.config.key,
        "passphrase": this.config.passphrase
    }

    this.apnconn = new apn.Connection(options);
}

util.inherits(dpdapn, Resource);

dpdapn.label = "APN";
dpdapn.events = ["post"];

dpdapn.prototype.clientGeneration = true;

dpdapn.basicDashboard = {
    settings: [
        {
            name        : 'cert',
            type        : 'string',
            description : 'Certificate file location (/home/..)'
        },
        {
            name        : 'key',
            type        : 'string',
            description : 'Key file location (/home/..)'
        },
        {
            name        : 'passphrase',
            type        : 'string',
            description : 'Apple Passphrase'
        },
        {
            name        : 'defaultMsg',
            type        : 'string',
            description : 'Default message'
        },
        {
            name        : 'badge',
            type        : 'string',
            description : 'Badge Count. Defaults to 1'
        },
        {
            name        : 'sound',
            type        : 'string',
            description : 'Sound file. Defaults to "ping.aiff"'
        }
    ]
}

dpdapn.prototype.handle = function ( ctx, next ) {

    var device = "";
    var message = "";

    if(ctx.body && ctx.body.device){
        device = ctx.body.device;
    }

    if(ctx.body && ctx.body.message){
        message = ctx.body.message;
    }else{
        message = this.config.defaultMsg ? this.config.defaultMsg : "New message";
    }

    var myDevice = new apn.Device(device);
    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 360000;
    note.badge = this.config.badge ? parseInt(this.config.badge) : 1;
    note.sound = this.config.sound ? this.config.sound : "ping.aiff";
    note.alert = message;
    if (ctx.body.payload) note.payload = ctx.body.payload;

    this.apnconn.pushNotification(note, myDevice);

}

module.exports = dpdapn;
