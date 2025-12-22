// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AIArtNFT.sol";

contract AIArtNFTTest is Test {
    AIArtNFT nft;

    address owner = address(0xA11CE);
    address user = address(0xB0B);
    address other = address(0xCAFE);

    string constant BASE_URI = "ipfs://";

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(user, 10 ether);
        vm.deal(other, 10 ether);

        vm.prank(owner);
        nft = new AIArtNFT(owner, BASE_URI);
    }

    /*//////////////////////////////////////////////////////////////
                              MINTING
    //////////////////////////////////////////////////////////////*/

    function testMintWithPrompt() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "a cyberpunk cat",
            "neon"
        );

        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(tokenId), user);

        (
            address requester,
            string memory prompt,
            string memory style,
            uint256 storedTokenId,
            bool fulfilled,
            string memory imageCID
        ) = nft.artRequests(tokenId);

        assertEq(requester, user);
        assertEq(prompt, "a cyberpunk cat");
        assertEq(style, "neon");
        assertEq(storedTokenId, tokenId);
        assertFalse(fulfilled);
        assertEq(imageCID, "");
    }

    function testMintFailsWithInsufficientPayment() public {
        vm.prank(user);
        vm.expectRevert("Insufficient payment");
        nft.mintWithPrompt{value: 0.001 ether}("art", "style");
    }

    function testMaxSupplyNotReached() public {
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(user);
            nft.mintWithPrompt{value: 0.01 ether}("art", "style");
        }

        assertEq(nft.ownerOf(9), user);
    }

    /*//////////////////////////////////////////////////////////////
                         FULFILL ART REQUEST
    //////////////////////////////////////////////////////////////*/

    function testFulfillArtRequestByOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "dragon",
            "oil painting"
        );

        vm.prank(owner);
        nft.fulfillArtRequest(tokenId, "QmImageCID");

        (
            ,
            ,
            ,
            ,
            bool fulfilled,
            string memory imageCID
        ) = nft.artRequests(tokenId);

        assertTrue(fulfilled);
        assertEq(imageCID, "QmImageCID");

        string memory uri = nft.tokenURI(tokenId);
        assertEq(uri, string(abi.encodePacked(BASE_URI, "QmImageCID")));
    }

    function testFulfillFailsIfNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "skull",
            "dark"
        );

        vm.prank(user);
        vm.expectRevert();
        nft.fulfillArtRequest(tokenId, "CID");
    }

    function testCannotFulfillTwice() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "robot",
            "sci-fi"
        );

        vm.prank(owner);
        nft.fulfillArtRequest(tokenId, "CID1");

        vm.prank(owner);
        vm.expectRevert("Already fulfilled");
        nft.fulfillArtRequest(tokenId, "CID2");
    }

    /*//////////////////////////////////////////////////////////////
                          UPDATE TOKEN URI
    //////////////////////////////////////////////////////////////*/

    function testUpdateTokenURIBeforeFulfill() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "forest",
            "watercolor"
        );

        vm.prank(user);
        nft.updateTokenURI(tokenId, "customCID"); 

        assertEq(nft.tokenURI(tokenId), "customCID");
    }

    function testUpdateTokenURIFailsAfterFulfill() public {
        vm.prank(user);
        uint256 tokenId = nft.mintWithPrompt{value: 0.01 ether}(
            "space",
            "abstract"
        );

        vm.prank(owner);
        nft.fulfillArtRequest(tokenId, "FINALCID");

        vm.prank(user);
        vm.expectRevert("Art already generated");
        nft.updateTokenURI(tokenId, "ipfs://newCID");
    }

    /*//////////////////////////////////////////////////////////////
                          ROYALTIES
    //////////////////////////////////////////////////////////////*/

    function testClaimRoyalties() public {
        vm.prank(user);
        nft.mintWithPrompt{value: 0.01 ether}("art", "style");

        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        nft.claimRoyalties();

        assertGt(owner.balance, ownerBalanceBefore);
    }

    function testClaimRoyaltiesFailsIfNotOwner() public {
        vm.prank(user);
        vm.expectRevert();
        nft.claimRoyalties();
    }

    /*//////////////////////////////////////////////////////////////
                          LAZY MINT
    //////////////////////////////////////////////////////////////*/

    function testLazyMint() public {
        vm.prank(user);
        uint256 tokenId = nft.lazyMint(
            user,
            "prompt",
            "style",
            "CID",
            hex"deadbeef"
        );

        assertEq(nft.ownerOf(tokenId), user);
        assertEq(
            nft.tokenURI(tokenId),
            string(abi.encodePacked(BASE_URI, "CID"))
        );
    }
}
