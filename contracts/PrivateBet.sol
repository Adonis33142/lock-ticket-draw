// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint64, euint8, externalEuint64, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Private Bet Outcome
/// @notice Fully homomorphic encryption powered betting simulation that keeps wagers, guesses, and results private.
/// @dev This contract demonstrates how FHE enables confidential wagering flows while retaining verifiable fairness.
/// @author Shadow Cipher Clash
contract PrivateBet is SepoliaConfig {
    /* solhint-disable gas-struct-packing */
    enum BetState {
        None,
        Settled
    }

    struct Bet {
        address player;
        euint64 wager;
        euint8 guess;
        euint8 outcome;
        euint64 payout;
        uint64 createdAt;
        BetState state;
    }
    /* solhint-enable gas-struct-packing */

    /// @notice Address that collects audit rights for the house.
    address public immutable HOUSE;
    /// @notice Total number of bets that have been settled.
    uint256 public betCount;

    mapping(uint256 betId => Bet betData) private _bets;
    mapping(uint256 betId => mapping(address viewer => bool allowed)) private _betViewers;

    /// @notice Emitted when a bet is placed and immediately settled.
    /// @param betId Numeric identifier of the bet.
    /// @param player Address that submitted the encrypted wager.
    event BetPlaced(uint256 indexed betId, address indexed player);
    /// @notice Emitted when encrypted winnings are ready for retrieval.
    /// @param betId Numeric identifier of the bet.
    /// @param player Address that submitted the encrypted wager.
    event BetSettled(uint256 indexed betId, address indexed player);

    error BetDoesNotExist(uint256 betId);
    error NotAuthorized(address account);

    /// @notice Initializes the contract, setting the house address.
    constructor() {
        HOUSE = msg.sender;
    }

    /// @notice Places a private bet on an odd/even outcome.
    /// @param wagerHandle Encrypted wager amount handle.
    /// @param wagerProof Input proof for the wager.
    /// @param guessHandle Encrypted guess handle (0 => even, 1 => odd).
    /// @param guessProof Input proof for the guess.
    /// @return betId Unique identifier of the settled bet.
    function placeBet(
        externalEuint64 wagerHandle,
        bytes calldata wagerProof,
        externalEuint8 guessHandle,
        bytes calldata guessProof
    ) external returns (uint256 betId) {
        euint64 wager = FHE.fromExternal(wagerHandle, wagerProof);
        euint8 guess = FHE.fromExternal(guessHandle, guessProof);

        // Random encrypted outcome: 0 (even) or 1 (odd)
        euint8 outcome = FHE.randEuint8(2);

        // Determine winner and payout = wager * 2 if guess == outcome else 0
        ebool isWinner = FHE.eq(guess, outcome);
        euint64 doubleStake = FHE.mul(wager, uint64(2));
        euint64 winMultiplier = FHE.asEuint64(isWinner);
        euint64 payout = FHE.mul(doubleStake, winMultiplier);

        // Persist bet
        betId = ++betCount;
        Bet storage bet = _bets[betId];
        bet.player = msg.sender;
        bet.wager = wager;
        bet.guess = guess;
        bet.outcome = outcome;
        bet.payout = payout;
        bet.createdAt = uint64(block.timestamp);
        bet.state = BetState.Settled;

        _allowContract(bet);
        _allowValues(bet, HOUSE);
        _allowPlayer(bet, msg.sender);
        _grantViewer(betId, msg.sender);
        _grantViewer(betId, HOUSE);

        emit BetPlaced(betId, msg.sender);
        emit BetSettled(betId, msg.sender);
    }

    /// @notice Returns basic bet metadata.
    /// @param betId Identifier returned by `placeBet`.
    /// @return player Address of the bettor.
    /// @return createdAt Timestamp of settlement.
    /// @return state Bet state (Settled == 1).
    function getBetSummary(uint256 betId) external view returns (address player, uint64 createdAt, BetState state) {
        Bet storage bet = _storedBet(betId);
        return (bet.player, bet.createdAt, bet.state);
    }

    /// @notice Returns encrypted wager, guess, outcome, and payout for the bet.
    /// @dev Caller must be the bettor or the house, otherwise access will revert.
    /// @param betId Identifier returned by `placeBet`.
    /// @return wager Encrypted wager handle.
    /// @return guess Encrypted guess handle.
    /// @return outcome Encrypted outcome handle.
    /// @return payout Encrypted payout handle.
    function getEncryptedBetDetails(
        uint256 betId
    ) external view returns (euint64 wager, euint8 guess, euint8 outcome, euint64 payout) {
        Bet storage bet = _storedBet(betId);
        if (!_isViewer(betId, msg.sender)) {
            revert NotAuthorized(msg.sender);
        }

        return (bet.wager, bet.guess, bet.outcome, bet.payout);
    }

    /// @notice Allows the bettor or house to grant decrypt permission to an auditor.
    /// @param betId Identifier returned by `placeBet`.
    /// @param auditor Address that should be able to decrypt the bet artifacts.
    function allowAudit(uint256 betId, address auditor) external {
        Bet storage bet = _storedBet(betId);
        if (!_isViewer(betId, msg.sender)) {
            revert NotAuthorized(msg.sender);
        }

        _allowValues(bet, auditor);
        _grantViewer(betId, auditor);
    }

    /// @notice Returns the address that owns the bet with the given identifier.
    /// @param betId Identifier returned by `placeBet`.
    /// @return owner Address of the bettor.
    function betOwner(uint256 betId) external view returns (address owner) {
        Bet storage bet = _storedBet(betId);
        return bet.player;
    }

    // solhint-disable-next-line use-natspec
    function _allowValues(Bet storage bet, address account) private {
        FHE.allow(bet.wager, account);
        FHE.allow(bet.guess, account);
        FHE.allow(bet.outcome, account);
        FHE.allow(bet.payout, account);
    }

    // solhint-disable-next-line use-natspec
    function _allowContract(Bet storage bet) private {
        FHE.allowThis(bet.wager);
        FHE.allowThis(bet.guess);
        FHE.allowThis(bet.outcome);
        FHE.allowThis(bet.payout);
    }

    // solhint-disable-next-line use-natspec
    function _allowPlayer(Bet storage bet, address player) private {
        _allowValues(bet, player);
    }

    // solhint-disable-next-line use-natspec
    function _grantViewer(uint256 betId, address account) private {
        _betViewers[betId][account] = true;
    }

    // solhint-disable-next-line use-natspec
    function _isViewer(uint256 betId, address account) private view returns (bool) {
        return _betViewers[betId][account];
    }

    // solhint-disable-next-line use-natspec
    function _storedBet(uint256 betId) private view returns (Bet storage bet) {
        bet = _bets[betId];
        if (bet.state == BetState.None) {
            revert BetDoesNotExist(betId);
        }
    }
}










