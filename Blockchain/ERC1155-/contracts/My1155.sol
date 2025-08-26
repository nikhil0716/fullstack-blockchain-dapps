// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Coursework ERC1155 (sports domain) with price, stock, batch mint & withdraw
contract My1155 is ERC1155, Ownable, ReentrancyGuard {
    string public name = "Coursework Sports Stock";
    string public symbol = "CSS";

    // Per-ID economics & supply
    mapping(uint256 => uint256) public price;       // wei per unit
    mapping(uint256 => uint256) public maxSupply;   // total cap per id
    mapping(uint256 => uint256) public totalMinted; // minted so far per id

    // Optional explicit per-ID URIs (ipfs://...); if empty, falls back to baseURI
    mapping(uint256 => string) private _tokenURI;
    string public baseURI;

    event PriceSet(uint256 indexed id, uint256 price);
    event StockSet(uint256 indexed id, uint256 maxSupply);
    event TokenURISet(uint256 indexed id, string uri);

    constructor(string memory _baseURI) ERC1155("") Ownable(msg.sender) {
        baseURI = _baseURI;
    }

    // ---------- Admin ----------
    function setPrice(uint256 id, uint256 newPriceWei) external onlyOwner {
        price[id] = newPriceWei;
        emit PriceSet(id, newPriceWei);
    }

    function setStock(uint256 id, uint256 newMax) external onlyOwner {
        require(newMax >= totalMinted[id], "stock < minted");
        maxSupply[id] = newMax;
        emit StockSet(id, newMax);
    }

    function setTokenURI(uint256 id, string memory newUri) external onlyOwner {
        _tokenURI[id] = newUri;
        emit TokenURISet(id, newUri);
    }

    function setBaseURI(string memory newBase) external onlyOwner {
        baseURI = newBase;
    }

    // ---------- Views ----------
    function uri(uint256 id) public view override returns (string memory) {
        bytes memory u = bytes(_tokenURI[id]);
        if (u.length > 0) return _tokenURI[id];
        // fallback to base: baseURI + id (simple concat)
        return string(abi.encodePacked(baseURI, _toString(id), ".json"));
    }

    function available(uint256 id) external view returns (uint256) {
        return maxSupply[id] - totalMinted[id];
    }

    // ---------- Mint ----------
    function mint(uint256 id, uint256 amount) external payable nonReentrant {
        require(amount > 0, "amount=0");
        uint256 p = price[id];
        require(p > 0, "price=0");
        require(msg.value == p * amount, "wrong ETH");
        require(totalMinted[id] + amount <= maxSupply[id], "out of stock");
        totalMinted[id] += amount;
        _mint(msg.sender, id, amount, "");
    }

    function mintTo(address to, uint256 id, uint256 amount) external payable nonReentrant {
        require(amount > 0, "amount=0");
        uint256 p = price[id];
        require(p > 0, "price=0");
        require(msg.value == p * amount, "wrong ETH");
        require(totalMinted[id] + amount <= maxSupply[id], "out of stock");
        totalMinted[id] += amount;
        _mint(to, id, amount, "");
    }

    function mintBatch(uint256[] calldata ids, uint256[] calldata amounts) external payable nonReentrant {
        require(ids.length == amounts.length, "len mismatch");
        uint256 total;
        for (uint256 i = 0; i < ids.length; i++) {
            require(amounts[i] > 0, "amount=0");
            uint256 id = ids[i];
            uint256 p = price[id];
            require(p > 0, "price=0");
            require(totalMinted[id] + amounts[i] <= maxSupply[id], "out of stock");
            total += p * amounts[i];
        }
        require(msg.value == total, "wrong ETH");
        for (uint256 i = 0; i < ids.length; i++) {
            totalMinted[ids[i]] += amounts[i];
        }
        _mintBatch(msg.sender, ids, amounts, "");
    }

    // ---------- Withdraw ----------
    function withdraw() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "no balance");
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "withdraw failed");
    }

    // ---------- utils ----------
    function _toString(uint256 value) internal pure returns (string memory) {
        // minimal uint to decimal string
        if (value == 0) return "0";
        uint256 temp = value; uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }
}
