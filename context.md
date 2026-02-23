Prompt que utilizei diretamente no lovable:

Quero um app para entregar qr codes da uazapi para meus clientes. A Uazapi é uma API de whatsapp não oficial, e quero um site onde eu posso:
No painel admin sem login criar uma instância (inserir url base, api key, e apelido)
cada instância que eu crio no painel admin gera um link público pra eu mandar pro cliente, e nesse link ele pode conectar a instância
O painel admin NÃO PRECISA DE AUTENTICAÇÃO.
Use o lovable cloud como backend.
a rota padrão da uazapi para conexão é
POST base_url/instance/connect 
e retorna algo assim
{
  "connected": false,
  "loggedIn": false,
  "jid": null,
  "instance": {
    "id": "i91011ijkl",
    "token": "abc123xyz",
    "status": "connected",
    "paircode": "1234-5678",
    "qrcode": "data:image/png;base64,iVBORw0KGg...",
    "name": "Instância Principal",
    "profileName": "Loja ABC",
    "profilePicUrl": "https://example.com/profile.jpg",
    "isBusiness": true,
    "plataform": "Android",
    "systemName": "uazapi",
    "owner": "user@example.com",
    "lastDisconnect": "2025-01-24T14:00:00Z",
    "lastDisconnectReason": "Network error",
    "adminField01": "custom_data",
    "openai_apikey": "sk-...xyz",
    "chatbot_enabled": true,
    "chatbot_ignoreGroups": true,
    "chatbot_stopConversation": "parar",
    "chatbot_stopMinutes": 60,
    "created": "2025-01-24T14:00:00Z",
    "updated": "2025-01-24T14:30:00Z",
    "currentPresence": "available"
  }
}
aí você tem que renderizar esse qrcode no frontend
claro que antes de você conectar, busque o status da instancia pra ver se ela ja esta conectada
com GET em base_url/instance/status
e voce recebe {
  "instance": {
    "id": "i91011ijkl",
    "token": "abc123xyz",
    "status": "connected",
    "paircode": "1234-5678",
    "qrcode": "data:image/png;base64,iVBORw0KGg...",
    "name": "Instância Principal",
    "profileName": "Loja ABC",
    "profilePicUrl": "https://example.com/profile.jpg",
    "isBusiness": true,
    "plataform": "Android",
    "systemName": "uazapi",
    "owner": "user@example.com",
    "lastDisconnect": "2025-01-24T14:00:00Z",
    "lastDisconnectReason": "Network error",
    "adminField01": "custom_data",
    "openai_apikey": "sk-...xyz",
    "chatbot_enabled": true,
    "chatbot_ignoreGroups": true,
    "chatbot_stopConversation": "parar",
    "chatbot_stopMinutes": 60,
    "created": "2025-01-24T14:00:00Z",
    "updated": "2025-01-24T14:30:00Z",
    "currentPresence": "available"
  },
  "status": {
    "connected": false,
    "loggedIn": false,
    "jid": null
  }
}
sempre envie o header "token" com o api_key da instância nas requisições

