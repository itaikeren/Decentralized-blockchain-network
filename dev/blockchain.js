// imports
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');
const MerkleTree = require('merkletreejs');
const crypto = require('crypto');
const BloomFilter = require('bloom-filter');

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];

	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	this.createNewBlock(100, '0', '0');
};

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
// help func
function sha256(data) {
  // returns Buffer
  return crypto.createHash('sha256').update(data).digest();
}

// init merkle tree
const leaves = this.pendingTransactions.map(x => sha256(JSON.stringify(x)));
const tree = new MerkleTree(leaves, sha256);

// init bloom filter
let filter = null;
if(tree.getLeaves().length > 1){
	const numberOfElements = tree.getLeaves().length;
	const falsePositiveRate = 0.01;
	filter = BloomFilter.create(numberOfElements, falsePositiveRate);

	this.pendingTransactions.forEach(trans =>{
		filter.insert(sha256(JSON.stringify(trans.transactionId)));
	});
};

// create the block
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: new Date(Date.now()).toUTCString(),
		bloomFilter: filter,
		merkleTreeRoot: tree.getRoot().toString('hex'),
		merkleTree: tree,
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

// reset and push
	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};


Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuid().split('-').join('')
	};

	return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()['index'] + 1;
};


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
};


Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length && validChain; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};

// Check with merkle tree
// Need at least 2 transactions in merkle tree!
Blockchain.prototype.transactionIsValid = function(block, transactionObj) {
	// help func
	function sha256(data) {
	  // returns Buffer
	  return crypto.createHash('sha256').update(data).digest()
	}

	const tree = block['merkleTree'];
	const root = tree.getRoot();
	const proof = tree.getProof(sha256(JSON.stringify(transactionObj)));
	const verified = tree.verify(proof, sha256(JSON.stringify(transactionObj)), root);

	if(verified){
		return {
			status: 'Valid',
			transactionId: transactionObj['transactionId'],
			merkleRoot: tree.getRoot().toString('hex'),
			blockIndex: block['index']
		}
	} else{
		return {
			status: 'NOT Valid',
			transactionId: transactionObj['transactionId'],
			merkleRoot: '---',
			blockIndex: '---'
		}
	}
};


Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};


Blockchain.prototype.getTransaction = function(transactionId) {
	// help func
	function sha256(data) {
	  // returns Buffer
	  return crypto.createHash('sha256').update(data).digest()
	}

	let correctTransaction = null;
	let correctBlock = null;
	let flag = false;

	// Using bloom filter at first IF for quick check
	this.chain.forEach(block => {
		if(block.bloomFilter && block.bloomFilter.contains(sha256(JSON.stringify(transactionId)))){
			block.transactions.forEach(transaction => {
				if (transaction.transactionId === transactionId) {
					correctTransaction = transaction;
					correctBlock = block;
					flag = true;
				};
			});
		};
	});

	if(!flag){
		this.pendingTransactions.forEach(transaction =>{
			if(transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = {
				hash: '---'};
			};
		});
	};

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};


Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if (transaction.recipient === address) balance += transaction.amount;
		else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};

module.exports = Blockchain;
