var Voting = artifacts.require("./Voting.sol");
var jjERC223 = artifacts.require("./jjERC223.sol");
var SafeMath  = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath,{gas:6700000});
  deployer.link(SafeMath,jjERC223);
  deployer.link(SafeMath,Voting);
  deployer.deploy(jjERC223,{gas:6700000});
  deployer.link(jjERC223, Voting);
  deployer.deploy(Voting, ['JAEJIN', 'HANBIN', 'MARKO'],'0x0', {gas: 6700000});
};
