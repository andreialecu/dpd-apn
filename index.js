var Resource = require('deployd/lib/resource');
var util     = require('util');
var apn      = require('node-apn-http2');
var _        = require('lodash');
var async    = require('async');

function dpdapn(options){

    Resource.apply(this, arguments);

    var options = {
        token: {
            "key": this.config.key,
            "keyId": this.config.keyId,
            "teamId": this.config.teamId,
        },
        "production": true
    }

    if (this.config.key && this.config.keyId && this.config.teamId) {
        this.apnconn = new apn.Provider(options);
    }
}

util.inherits(dpdapn, Resource);

dpdapn.label = "APN";
dpdapn.events = ["post"];

dpdapn.prototype.clientGeneration = true;

dpdapn.basicDashboard = {
    settings: [
        {
            name        : 'key',
            type        : 'string',
            description : 'Key file location (/home/..)'
        },
        {
            name        : 'keyId',
            type        : 'string',
            description : 'Certificate Key ID'
        },
        {
            name        : 'teamId',
            type        : 'string',
            description : 'Certificate Team ID'
        },
        {
            name        : 'appId',
            type        : 'string',
            description : 'App ID'
        },
        {
            name        : 'defaultTitle',
            type        : 'string',
            description : 'Default title'
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
    if (!this.apnconn) return;
    
    var devices = [];
    var message = "";

    if(ctx.body && ctx.body.devices){
        devices = ctx.body.devices;
    }

    if(ctx.body && ctx.body.message){
        message = ctx.body.message;
    }else{
        message = this.config.defaultMsg ? this.config.defaultMsg : "New message";
    }

    var note = new apn.Notification();

    note.topic = this.config.appId;
    note.expiry = Math.floor(Date.now() / 1000) + 360000;
    note.badge = this.config.badge ? parseInt(this.config.badge) : 1;
    note.sound = this.config.sound ? this.config.sound : "ping.aiff";
    note.alert = { body: message, title: ctx.body.title || this.config.defaultTitle, subtitle: ctx.body.subtitle };

    if (ctx.body.payload) note.payload = ctx.body.payload;

    try {
        var _this = this;
        _this.apnconn.send(note, devices).then(result => {
            ctx.done(null, {dispatched: true});        
        }).catch(ctx.done);
    } catch (err) {
      ctx.done(err);
    }
}

module.exports = dpdapn;
