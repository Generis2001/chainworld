// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ChainWorldRegistry {
    error AlreadyRegistered();
    error InvalidTokenId();
    error NotTokenOwner();
    error NotRegistered();
    error InvalidZone();
    error InvalidMeterValue();

    address public immutable chogContract;
    uint256 public totalRegistered;

    mapping(address => uint256) public registeredToken;
    mapping(address => bool) private _registered;
    mapping(address => uint8) public currentZone;
    mapping(address => uint8[5]) public meterSnapshot;
    mapping(uint8 => address) public lotOwner;
    mapping(uint8 => uint256) public lotToken;
    mapping(address => uint8) public playerLot;

    event Registered(address indexed player, uint256 tokenId, uint8 lotId);
    event ZoneMoved(address indexed player, uint8 zoneId);
    event MetersSaved(address indexed player, uint8[5] meters);

    constructor(address _chogContract) {
        chogContract = _chogContract;
    }

    function register(uint256 tokenId) external {
        if (_registered[msg.sender]) revert AlreadyRegistered();
        if (tokenId > 10000) revert InvalidTokenId();

        try IERC721(chogContract).ownerOf(tokenId) returns (address owner) {
            if (owner != msg.sender) revert NotTokenOwner();
        } catch {
            revert("NFT not found");
        }

        uint8 lotId;
        bool found;

        for (uint8 i = 0; i < 36; i++) {
            if (lotOwner[i] == address(0)) {
                lotId = i;
                found = true;
                break;
            }
        }

        if (!found) {
            lotId = uint8(totalRegistered % 36);
        }

        registeredToken[msg.sender] = tokenId;
        _registered[msg.sender] = true;
        lotOwner[lotId] = msg.sender;
        lotToken[lotId] = tokenId;
        playerLot[msg.sender] = lotId;

        unchecked {
            totalRegistered++;
        }

        emit Registered(msg.sender, tokenId, lotId);
    }

    function setZone(uint8 zoneId) external {
        if (!_registered[msg.sender]) revert NotRegistered();
        if (zoneId > 5) revert InvalidZone();

        currentZone[msg.sender] = zoneId;
        emit ZoneMoved(msg.sender, zoneId);
    }

    function saveMeterSnapshot(
        uint8 fundsPercent,
        uint8 hunger,
        uint8 social,
        uint8 rep,
        uint8 housing
    ) external {
        if (!_registered[msg.sender]) revert NotRegistered();
        if (fundsPercent > 100 || hunger > 100 || social > 100 || housing > 100 || rep > 255) {
            revert InvalidMeterValue();
        }

        uint8[5] memory meters = [fundsPercent, hunger, social, rep, housing];
        meterSnapshot[msg.sender] = meters;

        emit MetersSaved(msg.sender, meters);
    }

    function getLot(uint8 lotId) external view returns (address owner, uint256 tokenId) {
        return (lotOwner[lotId], lotToken[lotId]);
    }

    function getPlayer(address wallet) external view returns (uint256 tokenId, uint8 zone, uint8[5] memory meters) {
        return (registeredToken[wallet], currentZone[wallet], meterSnapshot[wallet]);
    }

    function isRegistered(address wallet) external view returns (bool) {
        return _registered[wallet];
    }
}
