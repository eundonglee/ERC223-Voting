// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import jjtoken_artifacts from '../../build/contracts/jjERC223.json'
import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);
var jjERC223 = contract(jjtoken_artifacts);

let candidates = {}


window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();
  let voteTokens = $("#vote-tokens").val();
  console.log(candidates)
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  $("#candidate").val("");
  $("#vote-tokens").val("");

  /* Voting.deployed() returns an instance of the contract. Every call
   * in Truffle returns a promise which is why we have used then()
   * everywhere we have a transaction call
   */
  jjERC223.deployed().then(function(jjContractInstance) {
    

    Voting.deployed().then(function(votingContractInstance){
	    console.log(votingContractInstance.address)
	console.log(web3.eth.accounts[0])
      jjContractInstance.transfer(votingContractInstance.address, voteTokens, candidateName , {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
        
        let div_id = candidates[candidateName];
        return votingContractInstance.totalVotesFor.call(candidateName).then(function(v) {
          $("#" + div_id).html(v.toString());
          $("#msg").html("");
          console.log("success");
        });
      });
      
    });
  });
}

/* The user enters the total no. of tokens to buy. We calculate the total cost and send it in
 * the request. We have to send the value in Wei. So, we use the toWei helper method to convert
 * from Ether to Wei.
 */

window.lookupVoterInfo = function() {
  let address = $("#voter-info").val();
  Voting.deployed().then(function(contractInstance) {
    contractInstance.voterDetails.call(address).then(function(v) {
      let [votedCandidate, votesPerCandidate] = v;
      $("#votes-cast").empty();
      $("#votes-cast").append("Votes cast per candidate: <br>");
      // let allCandidates = Object.keys(candidates);
      
      for(let i=0; i < votedCandidate.length; i++) {
        $("#votes-cast").append(web3.toAscii(votedCandidate[i]) + ": " + votesPerCandidate[i] + "<br>");
      }
    });
  });
}

window.lookupCurrentVote = function(){

  Voting.deployed().then(function(contractInstance){
    contractInstance.currentVote.call().then(function(v){
      let [candidate, currentVotes] = v;
      console.log("candidate:",candidate)
      console.log("currentVotes:",currentVotes)
      $("#votes-got").empty();
      $("#votes-got").append("Candidate got votes: <br>");

      for(let i=0; i < candidate.length; i++) {
        $("#votes-got").append(web3.toAscii(candidate[i]) + ": " + currentVotes[i] + "<br>");
      }

    })

  })
}
/* Instead of hardcoding the candidates hash, we now fetch the candidate list from
 * the blockchain and populate the array. Once we fetch the candidates, we setup the
 * table in the UI with all the candidates and the votes they have received.
 */
function populateCandidates() {

  jjERC223.deployed().then(function(ci){console.log(ci.address)})
  
  Voting.deployed().then(function(contractInstance) {
    
    contractInstance.allCandidates.call().then(function(candidateArray) {
      for(let i=0; i < candidateArray.length; i++) {
        /* We store the candidate names as bytes32 on the blockchain. We use the
         * handy toUtf8 method to convert from bytes32 to string
         */
        candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
      }
      setupCandidateRows();
      populateCandidateVotes();
      populateTokenData();
    });
  });
}

function populateCandidateVotes() {
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function(v) {
        $("#" + candidates[name]).html(v.toString());
      });
    });
  }
}

function setupCandidateRows() {
  Object.keys(candidates).forEach(function (candidate) { 
    $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
}

/* Fetch the total tokens, tokens available for sale and the price of
 * each token and display in the UI
 */
function populateTokenData() {
  Voting.deployed().then(function(contractInstance) {
    
    contractInstance.totalToken.call().then(function(result) {
      $("#contract-balance").html(web3.fromWei(result.toString()) + " Token");
    });
  });
} 

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Voting.setProvider(web3.currentProvider);
  jjERC223.setProvider(web3.currentProvider);
  populateCandidates();

});
