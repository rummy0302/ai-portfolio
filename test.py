from google import genai

client = genai.Client(api_key="AIzaSyBKltgDD2k0XZp3ZHtvy5Uo8VDZmUmsUF8")

response = client.models.generate_content(
    model="gemini-3-flash-preview", contents="Explain how AI works"
)
print(response.text)