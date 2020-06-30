require('babel-register')
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      from: '0x495de7E7A6f09c07691bBC6d58c19b7aE86c7d91',
      port: 8545,
      network_id: '*',
      gas: 470000
    }
  }
}

