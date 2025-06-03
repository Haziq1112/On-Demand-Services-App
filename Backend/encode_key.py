import base64

with open("credentials/firebase-adminsdk.json", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

with open("encoded_key.txt", "w") as out:
    out.write(encoded)

print("✅ Firebase key encoded successfully.")
