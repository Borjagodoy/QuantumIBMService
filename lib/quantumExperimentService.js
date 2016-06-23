'use strict'

const urlBase="https://quantumexperience.ng.bluemix.net/api/users/"
var Client = require('node-rest-client').Client;
var jsonfile = require('jsonfile')
var fs = require('fs');
var json; 
var idCode;
var experimentName;
var client = new Client();

function init(newExperimentName, srcDir){
	var file = "./example.json";
	experimentName= newExperimentName;
	json = fs.readFileSync(file).toString();
}

/*
This method get the UserId and accesToken of the user and call the method taht get 
CodeId for create a new experiment.
*/
function getLoginInfo(newExperimentName, userMail, password, srcDir){
	init(newExperimentName,srcDir);
	var userId="";
	var accesToken="";
	var args = {
		data: {email:userMail,
		password: password },
		headers: { "Content-Type": "application/json" }
	};	 
	client.post(urlBase+"login?include=user", args, function (data, response) {
		userId= data.userId;
		accesToken=data.id;
		getCodeId(userId, accesToken);
	});
}
/*
This method get the codeId of the new experiment created and call the query method
when we doing the simulation of the experiment in the Quantum chip.
*/
function getCodeId(userId, accesToken){
	var url = urlBase+userId+"/codes";
	var jsonExperimentNameobj = getjsonExperimentName();
	var args = {
		data: jsonExperimentNameobj,
		headers: { "Content-Type": "application/json",
		"X-Access-Token": accesToken }
	};
	client.post(url, args, function (data, response) {
		idCode = data.idCode;
		query(userId, accesToken,idCode);
	});	
}
/*
This method make the simulation our experiment in the Quantum chip and get de 
result of the simulation. Morover, this method call saveResultExperiment method where
we save the result of the simulate.
*/
function query(userId, accesToken, codeId){
	var url = urlBase+userId+"/codes/"+codeId+"/executions?deviceRunType=sim_realistic&fromCache=false";
	var args = {
		data: json,
		headers: { "Content-Type": "application/json",
		"X-Access-Token": accesToken }
	};
	client.post(url, args, function (data, response) {
		saveResultExperiment(data);
	});	
}

function getjsonExperimentName(){
	var tmp;
	tmp = json.substring(17);
	var jsonExperimentName = "{\"name\":\""+experimentName+"\",\"jsonQASM\":" + tmp;
	return jsonExperimentName;
}

function saveResultExperiment(data){
	fs.writeFileSync(experimentName+"Result.json", JSON.stringify(data, null, 4), 'utf8');
    console.log("Succes");
}

exports.newQuantumExperiment = function (experimentName, userEmail, password){
	getLoginInfo(experimentName, userEmail, password);
};

