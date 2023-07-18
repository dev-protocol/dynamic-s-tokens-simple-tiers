// SPDX-License-Identifier: MPL-2.0
// solhint-disable-next-line compiler-version
pragma solidity ^0.8.9;

import "@devprotocol/i-s-tokens/contracts/interfaces/ITokenURIDescriptor.sol";
import "@devprotocol/i-s-tokens/contracts/interfaces/ISTokensManagerStruct.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleTiers is ITokenURIDescriptor, Ownable {
	EnumerableSet.UintSet private tiers;
	mapping(uint256 => mapping(bytes32 => string)) public images;

	using EnumerableSet for EnumerableSet.UintSet;

	function image(
		uint256,
		address,
		ISTokensManagerStruct.StakingPositions memory _positions,
		ISTokensManagerStruct.Rewards memory,
		bytes32 _payload
	) external view returns (string memory) {
		uint256 amount = _positions.amount;
		uint256 pt;
		for (uint256 i = 0; i < tiers.length(); i++) {
			uint256 tier = tiers.at(i);
			if (tier <= amount && pt < tier) {
				pt = tier;
			}
		}
		return images[pt][_payload];
	}

	function setTier(
		uint256 _tier,
		bytes32 _payload,
		string memory _image
	) external onlyOwner {
		if (tiers.contains(_tier)) {
			tiers.remove(_tier);
		}
		tiers.add(_tier);
		images[_tier][_payload] = _image;
	}

	function removeTier(uint256 _tier, bytes32 _payload) external onlyOwner {
		tiers.remove(_tier);
		delete images[_tier][_payload];
	}

	function onBeforeMint(
		uint256,
		address,
		ISTokensManagerStruct.StakingPositions memory,
		bytes32
	) external pure returns (bool) {
		return true;
	}

	function name(
		uint256,
		address,
		ISTokensManagerStruct.StakingPositions memory,
		ISTokensManagerStruct.Rewards memory,
		bytes32
	) external pure returns (string memory) {
		return "";
	}

	function description(
		uint256,
		address,
		ISTokensManagerStruct.StakingPositions memory,
		ISTokensManagerStruct.Rewards memory,
		bytes32
	) external pure returns (string memory) {
		return "";
	}
}
