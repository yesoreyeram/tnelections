const _ = require("lodash");
const fs = require("fs");

var candidates = [];

console.log("TN election data collection");

var parseElectionResults = function (year, filename, callback) {
    fs.readFile(filename, "utf8", function (err, data) {
        if (year === 1967 || year === 1971) {
            data = data.split("rptConstituencySummary - Page 234 of 234")[1];
            var CandidateNamememory = [];
            var ConstituencyID = "";
            var Constituency = "";
            _.each(data.split("\n"), function (line) {
                if (["No. CANDIDATE SEX PARTY VOTES %", "No. CANDIDATE SEX PARTY VOTES %", "CANDIDATE NAME SEX AGE CATEGORY PARTY GENERAL POSTAL TOTAL", "VALID VOTES POLLED", "Election Commission of India- State Election, 2016 to the Legislative Assembly Of Tamil Nadu", "DETAILED RESULTS", "% VOTES", "POLLED"].indexOf(line.trim()) > -1) {} else if (line.indexOf("AGE CATEGORY PARTY GENERAL POSTAL TOTAL") > -1) {} else if (line.indexOf("TURNOUT TOTAL") > -1) {} else if (line.indexOf("GRAND TOTAL") > -1) {} else if (line.indexOf("Page ") === 0) {} else if (line.indexOf("Election Commission of India") === 0) {} else if (line.indexOf("ELECTORS : ") === 0) {} else if (line.indexOf("Constituency ") > -1) {
                    Constituency = line.split(" ").slice(2).join(" ").trim();
                    ConstituencyID = line.split(" ")[1];
                } else {
                    if (line.indexOf("None of the Above") > 1) {
                        line = line.replace("None of the Above", "None of the Above G 0 GEN");
                    }
                    if (line.indexOf("Page ") > 1) {
                        line = (line.substring(0, line.indexOf("Page ")))
                    }
                    if (line.split(" ").length > 4) {
                        var candidate = {};
                        if (CandidateNamememory.length > 0) {
                            candidate.Name = (CandidateNamememory.map(function (n) {
                                return n.trim()
                            }).join(" "))
                        } else {
                            var myarray = line.trim().split(" ");
                            myarray.splice(myarray.length - 4);
                            myarray.shift();
                            candidate.Name = myarray.join(" ");
                        }
                        candidate.YearOfElection = year;
                        candidate.Constituency = Constituency;
                        candidate.ConstituencyID = ConstituencyID;
                        candidate.TotalVotes = +(line.trim().split(" ")[line.trim().split(" ").length - 2]);
                        candidate.Party = line.trim().split(" ")[line.trim().split(" ").length - 3]
                        candidate.Gender = line.trim().split(" ")[line.trim().split(" ").length - 4];
                        CandidateNamememory = [];
                        candidates.push(candidate);
                    } else {
                        CandidateNamememory.push(line)
                    }

                }
            });
        }
        callback();
    });
}
parseElectionResults(1971, "input/txt/1971.txt", ReportResult)

function ReportResult() {

    console.log("Candidates by Gender");
    _.each(_.groupBy(candidates, function (o) {
        return o.Gender
    }), (k, v) => {
        console.log(v, k.length)
    });
    console.log("Candidates by Party");
    _.each(_.groupBy(candidates, function (o) {
        return o.Party
    }), (k, v) => {
        console.log(v, k.length)
    });
    console.log("Votes by Party");
    _.each(_.groupBy(candidates, function (o) {
        return o.Party
    }), (k, v) => {
        console.log(v, _.sumBy(k, (p) => {
            return p.TotalVotes
        }))
    })
    console.log("Total votes : ", _.sumBy(candidates, (o) => {
        return o.TotalVotes
    }))
    console.log("Total Contestants", candidates.length)
}