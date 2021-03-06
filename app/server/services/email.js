var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');

var ROOT_URL = process.env.ROOT_URL;

var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

var EMAIL_HOST = process.env.EMAIL_HOST;
var EMAIL_USER = process.env.EMAIL_USER;
var EMAIL_PASS = process.env.EMAIL_PASS;
var EMAIL_PORT = process.env.EMAIL_PORT;
var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

var options = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
};

var transporter = nodemailer.createTransport({
service: 'Gmail',
auth: {
  user: EMAIL_USER,
  pass: EMAIL_PASS
}});

var controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback){

  //if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  //}

  emailTemplates(templatesDir, function(err, template){
    if (err) {
      return callback(err);
    }

    data.emailHeaderImage = EMAIL_HEADER_IMAGE;
    data.emailAddress = EMAIL_ADDRESS;
    data.hackathonName = HACKATHON_NAME;
    data.twitterHandle = TWITTER_HANDLE;
    data.facebookHandle = FACEBOOK_HANDLE;
    template(templateName, data, function(err, html, text){
      if (err) {
        return callback(err);
      }

      transporter.sendMail({
        from: EMAIL_CONTACT,
        to: options.to,
        subject: options.subject,
        html: html,
        text: text
      }, function(err, info){
        if(callback){
          callback(err, info);
        }
      });
    });
  });
}

/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendVerificationEmail = function(email, token, callback) {

var verifyUrl = 'https://ycphacks.herokuapp.com/verify/' + token;
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: {
    personalizations: [
        {
          to: [
              {
                email: email,
              },
          ],
          subject: 'YCP Hacks - Verify your email',
        },
    ],
    from: {
      email: 'info@ycphacks.io'
    },
    content: [
        {
          type: 'text/plain',
          value: "Hit the link below to verify your email! \r\n " + verifyUrl,
        },
    ],
  },
});

//With promise
sg.API(request)
  .then(response => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(error => {
    //error is an instance of SendGridError
    //The full response is attached to error.response
    console.log(error.response.statusCode);
  });

//With callback
sg.API(request, function(error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});


 /* var options = {
    to: email,
    subject: "YCP Hacks - Verify your email"
  };

  var locals = {
    verifyUrl: 'https://ycphacks.herokuapp.com/verify/' + token
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  /*sendOne('email-verify', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
*/
};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function(email, token, callback) {
	
var resetUrl = 'https://ycphacks.herokuapp.com/reset/' + token;
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: {
    personalizations: [
        {
          to: [
              {
                email: email,
              },
          ],
          subject: 'YCP Hacks - Password reset requested!',
        },
    ],
    from: {
      email: 'info@ycphacks.io'
    },
    content: [
        {
          type: 'text/plain',
          value: 'Somebody (hopefully you!) has requested that your password be reset. If ' +
       'this was not you, feel free to disregard this email. This link will expire in one hour. \r\n ' + resetUrl,
        },
    ],
  },
});

//With promise
sg.API(request)
  .then(response => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(error => {
    //error is an instance of SendGridError
    //The full response is attached to error.response
    console.log(error.response.statusCode);
  });

//With callback
sg.API(request, function(error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});


/*
  var options = {
    to: email,
    subject: "YCP Hacks - Password reset requested!"
  };

  var locals = {
    title: 'Password Reset Request',
    subtitle: '',
    description: 'Somebody (hopefully you!) has requested that your password be reset. If ' +
      'this was not you, feel free to disregard this email. This link will expire in one hour.',
    actionUrl: 'https://ycphacks.herokuapp.com/reset/' + token,
    actionName: "Reset Password"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  /*sendOne('email-link-action', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
*/
};

/* Notify users when they've been accepted */
controller.notifyAccepted = function(email, callback) {
	
var acceptedUrl = 'https://ycphacks.herokuapp.com';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: {
    personalizations: [
        {
          to: [
              {
                email: email,
              },
          ],
          subject: "YCP Hacks - YOU'RE IN!",
        },
    ],
    from: {
      email: 'info@ycphacks.io'
    },
    content: [
        {
          type: 'text/plain',
          value: 'You\'ve been accepted to YCP Hacks! Now sign in to confirm your spot. \r\n ' + acceptedUrl,
        },
    ],
  },
});

//With promise
sg.API(request)
  .then(response => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(error => {
    //error is an instance of SendGridError
    //The full response is attached to error.response
    console.log(error.response.statusCode);
  });

//With callback
sg.API(request, function(error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});

/*
  var options = {
      to: email,
      subject: "YCP Hacks - YOU'RE IN!"
    };

    var locals = {
      title: 'Congratulations!',
      description: 'You\'ve been accepted to YCP Hacks! Now sign in to confirm your spot.',
      actionUrl: 'https://ycphacks.herokuapp.com',
      actionName: "Confirm Your Spot!"
    };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  /*sendOne('email-link-action', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
  */
};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function(email, callback){

var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: {
    personalizations: [
        {
          to: [
              {
                email: email,
              },
          ],
          subject: "YCP Hacks - Your password has been changed!",
        },
    ],
    from: {
      email: 'info@ycphacks.io'
    },
    content: [
        {
          type: 'text/plain',
          value: 'Somebody (hopefully you!) has successfully changed your password.',
        },
    ],
  },
});

//With promise
sg.API(request)
  .then(response => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  })
  .catch(error => {
    //error is an instance of SendGridError
    //The full response is attached to error.response
    console.log(error.response.statusCode);
  });

//With callback
sg.API(request, function(error, response) {
  if (error) {
    console.log('Error response received');
  }
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});

/*
  var options = {
    to: email,
    subject: "YCP Hacks - Your password has been changed!"
  };

  var locals = {
    title: 'Password Updated',
    body: 'Somebody (hopefully you!) has successfully changed your password.',
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  /*sendOne('email-basic', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
*/
};

module.exports = controller;
