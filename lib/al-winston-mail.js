'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Mail = undefined;

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file Transport file for outputting logs to email.
 *
 * @author Danny Salazar <dssm_15@hotmail.com>
 * MIT LICENSE
 */

function getTransport(options) {
	return _nodemailer2.default.createTransport(options);
}

/**
 * @constructs Mail
 * @param {object} options - hash of options.
 */
const Mail = exports.Mail = options => {
	options = options || {};

	if (!options.to) {
		throw 'We need to know who gonna receive this email!';
	}

	undefined.name = options.name || 'mail';
	undefined.to = options.to;
	undefined.from = options.from || `al-winston@${_os2.default.hostname()}.io`;
	undefined.subject = options.subject || `Winston: ${level} ${_os2.default.hostname()}`;
	undefined.level = options.level || 'error';
	undefined.handleExceptions = options.handleExceptions || false;

	/*
  * Supported services:
  *
  * ["126","163","1und1","AOL","DebugMail","DynectEmail","FastMail","GandiMail","Gmail","Godaddy",
  * "GodaddyAsia","GodaddyEurope","hot.ee","Hotmail","iCloud","mail.ee","Mail.ru","Maildev","Mailgun",
  * "Mailjet","Mailosaur","Mandrill","Naver","OpenMailBox","Outlook365","Postmark","QQ","QQex",
  * "SendCloud","SendGrid","SendinBlue","SendPulse","SES","SES-US-EAST-1","SES-US-WEST-2","SES-EU-WEST-1",
  * "Sparkpost","Yahoo","Yandex","Zoho","qiye.aliyun"]
  */
	if (options.service && typeof options.service === 'string') {
		const serviceConfig = {
			service: options.service,
			auth: {
				user: options.username,
				pass: options.password
			}
		};
		undefined.server = getTransport(serviceConfig);
	} else {
		const otherConfig = {
			host: options.host,
			port: options.port || 25,
			secure: options.secure || false,
			connectionTimeout: options.timeout || 10000
		};
		undefined.server = getTransport(otherConfig);
	}
};

/** @extends winston.Transport */
_util2.default.inherits(Mail, _winston2.default.Transport);

/**
 * Define a getter, so `winston.transports.Mail` is available and thus backwards compatible.
 */
_winston2.default.transports.Mail = Mail;

/**
 * This is the core method to log actions.
 *
 * @function log
 * @member Mail
 * @param {string} level - Level at which to log the message.
 * @param {string} msg - Message to log.
 * @param {Object} meta - Additional metadata to attach.
 * @param {function} callback - Callback function to execute and continue.
 */
Mail.prototype.log = (level, msg, meta, callback) => {
	if (meta) {
		meta = _util2.default.inspect(meta, null, 5);
	}

	const body = meta ? `${msg}\n\n${meta}` : msg;

	undefined.server.verify((err, success) => {
		if (err) {
			console.error(`We cannot verify server connection: ${err}`);
		}
	});

	undefined.server.sendMail({
		from: undefined.from,
		to: undefined.to,
		subject: undefined.subject,
		text: body
	}, (err, result) => {
		if (err) {
			self.emit('error', err);
		} else {
			self.emit('info', result.message);
		}

		if (typeof callback === 'function') {
			callback(null, true);
		}
	});
};