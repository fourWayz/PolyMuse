// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Royalty} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";



interface IAIArtGenerator {
    struct ArtRequest {
        address requester;
        string prompt;
        string style;
        uint256 tokenId;
        bool fulfilled;
        string imageCID;
    }
}

contract AIArtNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint96 public constant ROYALTY_BPS = 500; // 5%
    
    // IPFS base URI
    string public baseTokenURI;
    
    // Art generation requests
    mapping(uint256 => IAIArtGenerator.ArtRequest) public artRequests;

    // Optional per-token override URI (returned as-is when set)
    mapping(uint256 => string) private _overrideTokenURIs;
    
    // Events
    event ArtRequested(
        uint256 indexed requestId,
        address indexed requester,
        string prompt,
        string style,
        uint256 tokenId
    );
    
    event ArtFulfilled(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        string imageCID
    );
    
    event RoyaltiesClaimed(address indexed recipient, uint256 amount);
    
    constructor(
        address initialOwner,
        string memory _baseTokenURI
    ) 
        ERC721("AI Art NFT", "AIART") 
        Ownable(initialOwner)
    {
        baseTokenURI = _baseTokenURI;
        _setDefaultRoyalty(initialOwner, ROYALTY_BPS);
    }
    
    // Polymorphic minting functions
    function mintWithPrompt(string memory prompt, string memory style) 
        external 
        payable 
        returns (uint256) 
    {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        // Create art request
        artRequests[tokenId] = IAIArtGenerator.ArtRequest({
            requester: msg.sender,
            prompt: prompt,
            style: style,
            tokenId: tokenId,
            fulfilled: false,
            imageCID: ""
        });
        
        emit ArtRequested(tokenId, msg.sender, prompt, style, tokenId);
        
        return tokenId;
    }
    
    // Lazy minting - user provides metadata after generation
    function lazyMint(
        address to,
        string memory prompt,
        string memory style,
        string memory imageCID,
        bytes memory signature
    ) external returns (uint256) {
        require(_verifySignature(to, prompt, style, imageCID, signature), "Invalid signature");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        // Set token URI with generated art
        // store only the image CID; `tokenURI` will prepend `baseTokenURI`
        _setTokenURI(tokenId, imageCID);
        
        return tokenId;
    }
    
    // Fulfill art generation (callable by authorized generator)
    function fulfillArtRequest(
        uint256 tokenId,
        string memory imageCID
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");
        require(!artRequests[tokenId].fulfilled, "Already fulfilled");
        
        artRequests[tokenId].fulfilled = true;
        artRequests[tokenId].imageCID = imageCID;
        
        // Set token URI
        // store only the image CID; `tokenURI` will prepend `baseTokenURI`
        _setTokenURI(tokenId, imageCID);
        // clear any user override so generated art becomes authoritative
        delete _overrideTokenURIs[tokenId];
        
        emit ArtFulfilled(tokenId, tokenId, imageCID);
    }
    
    // Royalty functions
    function claimRoyalties() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No royalties to claim");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
        
        emit RoyaltiesClaimed(owner(), balance);
    }
    
    // Update token URI (only before fulfillment)
    function updateTokenURI(uint256 tokenId, string memory newURI) external {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!artRequests[tokenId].fulfilled, "Art already generated");
        // store the exact URI the user provided and return it as-is
        _overrideTokenURIs[tokenId] = newURI;
        // clear the stored tokenURI so ERC721URIStorage won't prepend baseURI
        _setTokenURI(tokenId, "");
    }
    
    // Polymorphic URI handling
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        // If a user-supplied override exists, return it verbatim.
        string memory overrideURI = _overrideTokenURIs[tokenId];
        if (bytes(overrideURI).length > 0) {
            return overrideURI;
        }
        return super.tokenURI(tokenId);
    }
    
    // Support for ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Internal functions
    function _verifySignature(
        address to,
        string memory prompt,
        string memory style,
        string memory imageCID,
        bytes memory signature
    ) internal pure returns (bool) {
        // TODO
        return true;
    }
    
    
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
}