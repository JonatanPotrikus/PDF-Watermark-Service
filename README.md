# PDF Watermark Service

Este projeto fornece um serviço de backend para adicionar marcas d'água a arquivos PDF. O serviço é construído com Node.js e utiliza a biblioteca `pdf-lib` para manipulação de PDFs.

## DEMO

VIA FORMULARIO HTML: https://pdf-watermark-service.onrender.com/

API: https://pdf-watermark-service.onrender.com


## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework web para Node.js.
- **pdf-lib**: Biblioteca para manipulação de PDFs.
- **Multer**: Middleware para manipulação de uploads de arquivos.

## Configuração do Projeto

### Pré-requisitos

- Node.js (>= v18.0.0)
- npm ou yarn

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/JonatanPotrikus/PDF-Watermark-Service.git
   ```
2. ** Navegue até o diretório do projeto**


    ```bash
    cd PDF-Watermark-Service
    ```

3. **Instale as dependências**

    ```bash
    npm install
    ```

#### Configuração do Servidor

Inicie o servidor

```
npm start
```

> O servidor estará disponível em http://localhost:3000.

### Como Usar

Endpoint: Adicionar Marca d'Água ao PDF

Método: POST

URL: http://localhost:3000/watermark

Headers:

Content-Type: multipart/form-data

Corpo da Requisição (form-data):

pdf: Arquivo PDF a ser modificado.

email: E-mail a ser adicionado como marca d'água.

nome: Nome a ser adicionado como marca d'água.

---
Exemplo de Requisição com Postman ou arquivo HTTP se tiver usando [Rest Client - Extensão VsCode](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

Abra o Postman e importe a coleção fornecida. [collection.json](collection.json)

---

```
pdf-watermark-service/
│
├── app.js                # Código principal do servidor
├── package.json          # Dependências e scripts
├── uploads/              # Diretório para arquivos temporários enviados
└── downloads/            # Diretório para arquivos PDF modificados

```


### Problemas Conhecidos

Problemas com a rotação do texto: Certifique-se de que a função degrees é usada corretamente para a rotação dos textos.
