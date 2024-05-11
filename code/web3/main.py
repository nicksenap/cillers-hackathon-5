from web3 import Web3

# Connect to local Geth node
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Check if the connection is successful
if w3.is_connected():
    print("Connected to Ethereum node")
else:
    print("Failed to connect to Ethereum node")

# Create a new Ethereum account
account = w3.eth.account.create('key_seed')
print(f"Account Address: {account.address}")

# Prepare a document to sign
document_text = 'Sample document to sign'
document_hash = Web3.keccak(text=document_text)

# Sign the document
signature = account.signHash(document_hash)
print(f"Document hash: {document_hash.hex()}")
print(f"Signature: {signature.signature.hex()}")

# Verify the signature
def verify_signature(document_hash, signature, public_address):
    # Recover the signer from the signature
    signer = w3.eth.account._recover_hash(document_hash, signature=signature.signature)
    # Check if the recovered signer address matches the expected public address
    return signer == public_address

# Check the verification
is_valid = verify_signature(document_hash, signature, account.address)
print(f"Signature valid: {is_valid}")
