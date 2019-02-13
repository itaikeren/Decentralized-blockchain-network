# Decentralized Blockchain Network

Hey! This is a project that I was asked to made for a course in my software engineering degree. Since I really enjoyed the process and the idea itself I decided to take a few steps forward in this project and create a little more options in this Blockchain and a friendly UI. Hope you find it useful.


## Done

 - Building the skeleton of the Blockchain (creating structures and
   methods)
 - Proof Of Work
 - Merkle Tree
 - Transaction verification
 - Bloom Filter
 - Creating API
 - P2P Network
 - Creating UI (Block Explorer)

## Node Modules

- Crypto \ SHA256
- uuid
- merkletreejs@0.0.18
- bloom-filter@0.2.0
- express
- body-parser
- request-promise
- nodemon


# Installation Instructions

1. Run this commed in your Sheel: `npm run nod_X` (X --> number 1-5)
 ![installation1](https://i.imgur.com/Lf5gC1W.png)

2. To view the Blockchain go to: `http://localhost:300X/blockchain`
![installation2](https://i.imgur.com/zjaAzwN.png)

# Actions

- **To cause servers to recognize each other, run the following POST command:**
`http://localhost:300X/register-and-broadcast-node`

	With this body: 
	![actions1](https://i.imgur.com/6sgBQ7p.png)

	 *(X in the body need to be different then the one in the URL)*
 
- **To execute a transaction, run the following POST command:**
`http://localhost:300X/transaction/broadcast`

	With this body:
![actions2](https://i.imgur.com/BZLnFVT.png)

- **To execute mining, run the following GET command:**
 `http://localhost:300X/mine`

- **Synchronize to all servers and make sure everyone runs the latest chain:**
`http://localhost:300X/consensus`

# Friendly User Interface

I created an interface that simulates Block Explorer and allows for a more convenient and user friendly view of blocks / transactions / wallet addresses / transaction verification.
In order to access the interface, at least one Blockchain server must be installed (as explained in the installation instructions) and run the following address: `http://localhost:300X/block-explorer`

![UI1](https://i.imgur.com/cI88pQM.png)
![UI2](https://i.imgur.com/m2S2qU6.png)
![UI3](https://i.imgur.com/lAVrN4x.png)

*Thank you!
Itai.*
