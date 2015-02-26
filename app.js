// Load the http module to create an http server.
var http = require("http");
var keys = require("keys.js");
var sendgrid = require("sendgrid")(keys.sendgrid_username, keys.sendgrid_password);
var https = require("https");
var format = require("json-nice");
var nodemailer = require("nodemailer");
var jade = require('jade');
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});


// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: keys.gmail_username,
        pass: keys.gmail_password
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: "Fred Foo  <Bananas@bananacompany.com>", // sender address 
    to: "ayachamaneni@gmail.com", // list of receivers 
    subject: "Bananas", // Subject line 
    text: "Hello Reddy ", // plaintext body 
    html: html_content // html body 
};
 
// send mail with defined transport object 
var sendEmail = function() {
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + info.response);
    }
});
}
sendEmail();
// var myint = setInterval(sendEmail,1000)


var jsonstuff;
// var email = new sendgrid.Email();
// // var html-content = "";
// email.addTo("ayachamaneni@gmail.com");
// email.setFrom("anuraag@anuraag.me");
// email.setSubject("Sending with SendGrid is Fun");
// email.setHtml("");

// sendgrid.send(email);
//Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");

https.get("https://api.angel.co/1/jobs?access_token=" + keys.angellist_token, function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.body = "";

  res.on("data", function(d) {
    // process.stdout.write(d);
    res.body += d;
    // console.log(res.data);
  });

  res.on("end", function() {
    // process.stdout.write(d);
    var yo = res.body;
    var jobArray = {};
    var internshipIDs = [];
    var formatted = format(yo);
    var parsed = JSON.parse(yo);
    for(var x = 0; x < parsed.jobs.length; x++)
    {
    	if(parsed.jobs[x].job_type == "internship"){
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
    				if(parsed.jobs[x].tags[y].tag_type == "SkillTag"){
    					skills.push(parsed.jobs[x].tags[y].display_name);
    				}
    			}
    			tempJob.skills = skills;
    		    console.log(tempJob);
    	}

    }
  });

}).on("error", function(e) {
  console.error(e);
});

// Search for a internship name 
