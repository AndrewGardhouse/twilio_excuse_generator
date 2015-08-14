var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var twilio = require('twilio');
var client = twilio('AC5e649ec620d49f0106099276d5a30b74', '25263c144590e1bdb59176dcd043a065')
var schedule = require('node-schedule');
var moment = require('moment');
var rant = require('rantjs');

app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/sms', function(req, res) {

  var resp = new twilio.TwimlResponse();
  var userText = req.body.Body.toLowerCase().trim();
  var twilioNumber = req.body.To;
  var user = req.body.From;

  if (userText.match(/^(get me (outta||out of) here(!+)?)$/)) {
    resp.message("Hello, and thank you for choosing Get Me Outta Here as the pilot to your escape pod from social awkwardness or whatever uncomfortable situation life has thrown at you. Our crack team of escape artists are more than happy to help you, we just need a couple pieces of information to complete our job. If you wish to receive a tailor made excuse this moment, please text 'Get me outta here now!' or if you want to receive one in the not too distant future, please text us the time (in minutes) in which you want get out of the sticky situation (ie: 'Get me outta here in 15 minutes')");
  } else if (userText === "get me outta here now!") {
    resp.message(rant("<greet>, it's <firstname>, <firstname>'s <noun> has been <verb ed>! Hop in the <noun vehicle> and get to the <place> ASAP!!!"));
  } else if (userText.match(/(get me (outta||out of) here in \d+ minute(s)? ?(!+)?)/) ) {
    
    // pulls the minutes from the text 
    var minutes = userText.match(/\d+/)[0];

    // caluculates the exact time when to send a user a text
    var timeToLeave = moment().add(parseInt(minutes), 'm')._d;

    if (minutes == 1) {
      console.log("WOrking")
      resp.message("You will recieve a message in 1 minute");
    } else {
      resp.message("You will recieve a message in " + minutes + " minutes");
    }
    
    schedule.scheduleJob(timeToLeave, function(){
      client.sendMessage({
          to: user,
          from: twilioNumber, 
          body: rant("<greet>, it's <firstname>, <firstname>'s <noun> has been <verb ed>! Hop in the <noun vehicle> and get to the <place> ASAP!!!") // body of the SMS message
      }, function(err, responseData) { 
          if (!err) {
              console.log(responseData.from);
              console.log(responseData.body);
          } else {
            console.log(err);
          }
      });
    });
  } 
   else {
    resp.message("Sorry, we don't quite understand what you were trying to say.");
  }

  // Render the TwiML response as XML
  res.send(resp.toString());
});

app.listen(process.env.PORT || 3000);
