//import required libraries
var dns = require("native-dns");
var util = require("util");
const ping = require("ping");

async function findBestIP(ipArray) {
  let bestIP = ipArray[0].address;
  let lowestPing = Infinity;

  for (const ipInfo of ipArray) {
    if (ipInfo.address != undefined) {
      if (ipInfo && ipInfo.address) {
        try {
          const res = await ping.promise.probe(ipInfo.address);
          if (res.alive && res.time < lowestPing) {
            lowestPing = res.time;
            bestIP = ipInfo.address;
          }
        } catch (error) {
          // Handle ping error (e.g., host unreachable or ICMP blocked)
          console.error(`Error pinging ${ipInfo.address}: ${error.message}`);
          bestIP = ipInfo.address;
        }
      } else {
        console.error(`Invalid IP information: ${JSON.stringify(ipInfo)}`);
      }
    }
  }

  return bestIP;
}

var customEntries = {
  "test.dns": [
    {
      name: "test.dns",
      address: "127.1.2.1",
      ttl: 30,
    },
    {
      name: "test.dns",
      address: "127.1.2.2",
      ttl: 30,
    },
    {
      name: "test.dns",
      address: "127.1.2.3",
      ttl: 30,
    },
  ],
};

var server = dns.createServer();

server.on("request", function (request, response) {
  var domain = request.question[0].name;
  if (customEntries[domain]) {
    //if custom entry exists, push it back...
    var entries = customEntries[domain];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      response.answer.push(dns.A(entry));
    }
    response.send();
  } else {
    var question = dns.Question({
      name: domain,
      type: "A",
    });
    var req = dns.Request({
      question: question,
      server: { address: "8.8.8.8", port: 53, type: "udp" },
      timeout: 5000,
    });
    req.on("message", function (err, answer) {
      var entries = [];
      // answer.answer.forEach(function (a) {
      //   entries.push(a);
      //   // console.log(a);
      // });
      const dnsRecordArray = [];
      // console.log(request.question);

      var ipArray = answer.answer;
      console.log(ipArray);

      findBestIP(ipArray)
        .then((bestIP) => {
          setTimeout(function () {
            if (bestIP != undefined) {
              console.log(`IP dengan ping terkecil: ${bestIP}`);

              response.answer.push(
                dns.A({
                  name: request.question[0].name,
                  address: bestIP,
                  ttl: 600,
                })
              );
              response.send();
            } else {
              console.log("hai");
              // console.log(answer.answer[0]);
              // response.answer.push(dns.A(answer.answer[0]));
              ipArray.forEach(function (a) {
                if (a.hasOwnProperty("address")) {
                  response.answer.push(dns.A(a));
                  response.additional.push(dns.A(a));
                  console.log(a);
                }
                if (a.hasOwnProperty("data")) {
                  response.answer.push(dns.CNAME(a));
                  response.additional.push(dns.CNAME(a));
                  console.log(a);
                }
              });
              response.send();
            }
          }, 1500);
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        });

      // answer.answer.forEach((record) => {
      //   dnsRecordArray.push({
      //     name: record.name,
      //     type: record.type,
      //     class: record.class,
      //     ttl: record.ttl,
      //     address: record.address,
      //   });
      // });
      // console.log(dnsRecordArray[0]);

      // if (entries.length > 0) {
      //   setTimeout(function () {
      //     // console.log(entries[0]);
      //     response.answer.push(dns.A(entries[0]));
      //     response.send();
      //   }, 1000);
      // }
    });

    req.send();
  }
});

server.on("error", function (err, buff, req, res) {
  console.log(err.stack);
});

console.log("Listening on " + 53);
server.serve(53);
