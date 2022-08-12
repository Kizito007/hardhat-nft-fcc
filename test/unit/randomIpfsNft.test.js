// make sure it initializes correctly
/* Request NFT function
    it should revert if amount is less than mint fee
    it should map requestId sender to address
    it should assure the NftRequested event is emmited
*/
/* Fulfill Random Words
    it should find the mod of random words to max-chance-value
    should increase token counter
    should safeMint with dogOwner and request Id
    should set token uri...
    should emit that minted event
*/
/* Withdraw
    revert if error
*/
/* Get breed from moddedRng 
    30- true, 
    it should set breed if moddedRng is >= cummulative sum &
    if moddedRng is < cummulative sum + chanceArray index
    revert with error on error
*/
const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS Unit Tests", function () {
          let randomIpfsNft, deployer, mintFee
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              // Returns a new connection to the VRFCoordinatorV2Mock contract
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              mintFee = await randomIpfsNft.getMintFee()
          })

          describe("constructor", function () {
              it("ensures theres an NFT", async function () {
                  const tokenUri = await randomIpfsNft.getDogTokenUris(0)
                  const isInitialized = await randomIpfsNft.getIsInitialized()

                  assert(tokenUri.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })

          describe("Request NFT", function () {
              it("should revert if amount is less than mint fee", async function () {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith("NeedMoreETHSent")
              })
              it("emits an event and kicks off a random word request", async function () {
                  await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("Fulfill Random Words", function () {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0")
                              const tokenCounter = await randomIpfsNft.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: mintFee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })

          describe("Withdraw", function () {
              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await randomIpfsNft.connect(attacker)
                  await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
                      "Ownable: caller is not the owner" // because of chainlink modifier
                  )
              })
          })
      })
