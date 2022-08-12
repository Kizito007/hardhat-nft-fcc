// ensure constructor initializes correctly
/* 
    svgToImageURI
    should encode the imageUri to base64, concatenate and return
*/
/* 
    mintNft
    increment token counter, ensure mint is successsful 
    to create an event
*/
/* 
    tokenUri
    reverts with "URI Query for nonexistent token" if tokenId is existent
    e.t.c.
*/

const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
          let dynamicSvgNft, deployer, mockV3Aggregator
          let base64Prefix = "data:image/svg+xml;base64,"
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              // Returns a new connection to the MockV3Aggregator contract
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
          })

          describe("constructor", function () {
              it("ensures constructor initializes correctly", async function () {
                  const lowImageUri = await dynamicSvgNft.getLowSVG()
                  const highImageUri = await dynamicSvgNft.getHighSVG()
                  //   const priceFeed = await dynamicSvgNft.getPriceFeed()

                  assert(lowImageUri.includes(base64Prefix))
                  assert(highImageUri.includes(base64Prefix))
                  //   assert.equal(priceFeed, mockV3Aggregator.address)
              }) // killed constructor and svgToImageUri
          })

          describe("mintNft", () => {
              it("emits an event and creates the NFT", async function () {
                  const highValue = ethers.utils.parseEther("1") // 1 dollar per ether
                  await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
                      dynamicSvgNft,
                      "CreatedNFT"
                  )
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
                  //   const tokenURI = await dynamicSvgNft.tokenURI(0)
                  //   assert.equal(tokenURI, highTokenUri)
              })
              //   it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
              //       const highValue = ethers.utils.parseEther("100000000") // $100,000,000 dollar per ether. Maybe in the distant future this test will fail...
              //       const txResponse = await dynamicSvgNft.mintNft(highValue)
              //       await txResponse.wait(1)
              //       const tokenURI = await dynamicSvgNft.tokenURI(0)
              //       assert.equal(tokenURI, lowTokenUri)
              //   })
          })
      })
