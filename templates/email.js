var keys = require("../keys.js");
var sendgrid = require("sendgrid")(keys.sendgrid_username, keys.sendgrid_password);
var https = require("https");
var format = require("json-nice");
var jade = require("jade");
var juice = require('juice2');
var file = require('read-file');
var jobArray = [];


// Put a "friendly" message on the terminal
console.log("Fired up the email sender!");

var sendEmail = function(html) {
  sendgrid.send({
    to:       keys.emails,
    from:     'internships@internbox.io',
    subject:  'Test 4',
    html:     html
  },
  function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
}



var emailBuild = function(jobArray) {
  var fn = jade.compileFile('templates/email.jade');
  var html = fn(
    {'internships': jobArray}
    );
  var css = file.readFileSync('simple.css');
  html = juice.inlineContent(html, css);
  console.log(html);
  sendEmail(html);
}
var getAngel = function() {
https.get("https://api.angel.co/1/jobs?access_token=" + keys.angellist_token + "&page=1", function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.body = "";

  res.on("data", function(d) {
    res.body += d;
  });

  res.on("end", function() {
      // process.stdout.write(d);
      var yo = res.body;
      // var jobArray = [];
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
         jobArray.push(tempJob);
         // console.log(parsed.jobs[x]);
       }
     }
     // emailBuild(jobArray);
     // console.log(parsed);
   });

}).on("error", function(e) {
  console.error(e);
});
https.get("https://api.angel.co/1/jobs?access_token=" + keys.angellist_token + "&page=2", function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.body = "";

  res.on("data", function(d) {
    res.body += d;
  });

  res.on("end", function() {
      // process.stdout.write(d);
      var yo = res.body;
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
         jobArray.push(tempJob);
         // console.log(parsed.jobs[x]);
       }
     }
     // emailBuild(jobArray);
     // console.log(parsed);
   });

}).on("error", function(e) {
  console.error(e);
});

var api = require('indeed-api').getInstance('9419974226597419');
api.JobSearch()
    .Radius(30)
    .WhereLocation({
        city : "Washington",
        state : "DC"
    })
    .Limit(1000)
    .WhereKeywords(["Software Development"])
    .WhereJobType("internship")
    .SortBy("date")
    .UserIP("1.2.3.4")
    .UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
    .Search(
        function (resultss) {
          var parsed = JSON.parse(format(resultss));
          console.log(parsed.results);
          for(var x = 0; x < parsed.results.length; x++)
          {
              var tempJob = {
                title: parsed.results[x].jobtitle,
                company: parsed.results[x].company,
                description: parsed.results[x].snippet,
                url: parsed.results[x].url
                };
               jobArray.push(tempJob);
               // console.log(tempJob);
               // console.log(1);
               // console.log(jobArray);
               // console.log(results);
          }
          getAngel();
        },
        function (error) {
        // do something with the error results 
        console.log(error);
    });
var hackysol = setTimeout(function() {
  emailBuild(jobArray);
  console.log(jobArray);
},7000);