// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SSIRegistry {
    
    // Storage
    mapping(bytes32 => uint256) public anchored;
    mapping(bytes32 => bool) public revoked;
    
    // Events
    event CredentialAnchored(bytes32 indexed credentialHash, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed credentialHash);
    
    // Anchor a credential
    function anchor(bytes32 credentialHash) public {
        require(anchored[credentialHash] == 0, "Already anchored");
        anchored[credentialHash] = block.timestamp;
        emit CredentialAnchored(credentialHash, block.timestamp);
    }
    
    // Anchor multiple credentials (gas efficient)
    function anchorBatch(bytes32[] memory hashes) public {
        for (uint i = 0; i < hashes.length; i++) {
            if (anchored[hashes[i]] == 0) {
                anchored[hashes[i]] = block.timestamp;
                emit CredentialAnchored(hashes[i], block.timestamp);
            }
        }
    }
    
    // Revoke a credential
    function revoke(bytes32 credentialHash) public {
        revoked[credentialHash] = true;
        emit CredentialRevoked(credentialHash);
    }
    
    // Check if revoked
    function isRevoked(bytes32 credentialHash) public view returns (bool) {
        return revoked[credentialHash];
    }
}