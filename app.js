// Load the http module to create an http server.
var http = require('http');
var keys = require('/Users/Anuraag/NodeStuff/project/keys.js');
var sendgrid = require("sendgrid")(keys.sendgrid_username, keys.sendgrid_password);
var https = require('https');
var format = require('json-nice');
var nodemailer = require('nodemailer');
var html_content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> <meta name="viewport" content="width=device-width"/> <!-- For development, pass document through inliner --> <link rel="stylesheet" href="css/simple.css"> <style type="text/css"> /* Your custom styles go here */ </style> </head> <body> <table class="body-wrap"> <tr> <td class="container"> <!-- Message start --> <table> <tr> <td align="center" class="masthead"> <h1>Something Big...</h1> </td> </tr> <tr> <td class="content"> <h2>Hi Stranger,</h2> <p>Kielbasa venison ball tip shankle. Boudin prosciutto landjaeger, pancetta jowl turkey tri-tip porchetta beef pork loin drumstick. Frankfurter short ribs kevin pig ribeye drumstick bacon kielbasa. Pork loin brisket biltong, pork belly filet mignon ribeye pig ground round porchetta turducken turkey. Pork belly beef ribs sausage ham hock, ham doner frankfurter pork chop tail meatball beef pig meatloaf short ribs shoulder. Filet mignon ham hock kielbasa beef ribs shank. Venison swine beef ribs sausage pastrami shoulder.</p> <table> <tr> <td align="center"> <p> <a href="#" class="button">Share the Awesomeness</a> </p> </td> </tr> </table> <p>By the way, if you are wondering where you can find more of this fine meaty filler, visit <a href="http://baconipsum.com">Bacon Ipsum</a>.</p> <p><em>– Mr. Pen</em></p> </td> </tr> </table> </td> </tr> <tr> <td class="container"> <!-- Message start --> <table> <tr> <td class="content footer" align="center"> <p>Sent by <a href="#">Company Name</a>, 1234 Yellow Brick Road, OZ, 99999</p> <p><a href="mailto:">hello@company.com</a> | <a href="#">Unsubscribe</a></p> </td> </tr> </table> </td> </tr> </table> </body> </html>'

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});


// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: keys.gmail_username,
        pass: keys.gmail_password
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'Fred Foo  <Bananas@bananacompany.com>', // sender address 
    to: 'ayachamaneni@gmail.com', // list of receivers 
    subject: 'Bananas', // Subject line 
    text: 'Hello Reddy ', // plaintext body 
    html: html_content // html body 
};
 
// send mail with defined transport object 
var sendEmail = function() {
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
}
sendEmail();
// var myint = setInterval(sendEmail,1000)


var jsonstuff;
// var email = new sendgrid.Email();
// // var html-content = '';
// email.addTo("ayachamaneni@gmail.com");
// email.setFrom("anuraag@anuraag.me");
// email.setSubject("Sending with SendGrid is Fun");
// email.setHtml("");

// sendgrid.send(email);
//Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");

https.get('https://api.angel.co/1/jobs?access_token=' + keys.angellist_token, function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.body = "";

  res.on('data', function(d) {
    // process.stdout.write(d);
    res.body += d;
    // console.log(res.data);
  });

  res.on('end', function() {
    // process.stdout.write(d);
    var yo = res.body;
    var jobArray = {};
    var internshipIDs = [];
    var formatted = format(yo);
    var parsed = JSON.parse(yo);
    for(var x = 0; x < parsed.jobs.length; x++)
    {
    	if(parsed.jobs[x].job_type == 'internship'){
    			var tempJob = {
    				title: parsed.jobs[x].title,
    				company: parsed.jobs[x].startup.name,
    				description: parsed.jobs[x].description,
    				salary_max: parsed.jobs[x].salary_max,
    				url: parsed.jobs[x].angellist_url,
    				remote: parsed.jobs[x].remote_ok
    			};
    			var skills = [];
    			for(var y = 0; y < parsed.jobs[x].tags.length; y++){
    				if(parsed.jobs[x].tags[y].tag_type == 'SkillTag'){
    					skills.push(parsed.jobs[x].tags[y].display_name);
    				}
    			}
    			tempJob.skills = skills;
    		    console.log(tempJob);
    	}

    }
  });

}).on('error', function(e) {
  console.error(e);
});
 

// // Init the object with your API key 
// angel.init('133e64ac161f3d33956a9555dc3de411dd09415f5ce36cd7'
// , '5e9096fbe19f88c1336ba38e858028bd8f4166c5a3acdba7');
 
// Search for a internship name 
