const { assert } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Tests", function () {
          let basicNft, deployer, tokenCounter
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployer)
              tokenCounter = await basicNft.getTokenCounter()
          })

          describe("constructor", function () {
              it("initializes the NFT correctly", async function () {
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("safe mint", function () {
              it("should increment counter by 1", async function () {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
                  const tokenURI = await basicNft.tokenURI(0)
                  tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
                  assert.equal(tokenCounter.toString(), "1")
              })
          })

          describe("get token counter", function () {
              it("should get the token counter", async function () {
                  tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
      })
