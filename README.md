# File & Auth Management System

Aplicação web de portfólio que combina autenticação de usuários com organização de arquivos. A pessoa usuária cria uma conta, entra com um token JWT, envia arquivos e acompanha o histórico em um dashboard.

> **Status:** aplicação integrada para execução local. Uma URL pública de demonstração ainda não foi configurada.

## Objetivo do projeto

O objetivo é reunir, em uma aplicação web, duas funcionalidades:

- Autenticação de usuários por meio de uma API.
- Organização de arquivos por categoria e data.

O desenvolvimento foi feito em etapas no PyCharm, acompanhando a configuração do ambiente, a criação do backend, a autenticação, o organizador e a integração com a interface web.

## Funcionalidades

- Cadastro de usuário com e-mail, nome de usuário e senha.
- Login usando e-mail ou nome de usuário.
- Senhas armazenadas com hash.
- Autenticação JWT e proteção das rotas privadas.
- Envio de arquivos por seleção ou arrastar e soltar.
- Limite de 50 MB por arquivo.
- Organização dos arquivos por categoria e mês.
- Tratamento de nomes repetidos para evitar sobrescrita.
- Histórico separado por usuário, com busca e filtro por categoria.
- Dashboard com quantidade de arquivos, espaço ocupado e categoria mais ativa.
- Gráfico de distribuição por categoria.
- Tema claro e escuro.

## Processo de desenvolvimento

O projeto evoluiu de uma API de autenticação e um organizador de arquivos para uma aplicação web integrada:

1. Definição do objetivo e das funcionalidades do sistema.
2. Configuração do ambiente Python no PyCharm.
3. Criação da API com FastAPI e do banco SQLite com SQLAlchemy.
4. Implementação do cadastro, login, hash de senhas, JWT e rotas protegidas.
5. Desenvolvimento da organização de arquivos por extensão, categoria e mês.
6. Criação da interface em HTML, CSS e JavaScript.
7. Integração da interface com o backend para autenticação, envio de arquivos e consulta ao histórico.

## Tecnologias

- **Python** para o backend.
- **FastAPI** para a API e o servidor web.
- **SQLAlchemy** para persistência de dados.
- **SQLite** como banco de dados local.
- **Pydantic** para validação de dados.
- **JWT** com PyJWT para autenticação.
- **pwdlib** para hash e verificação de senhas.
- **HTML, CSS e JavaScript** para o frontend.
- **Chart.js** para o gráfico do dashboard.

## Organização dos arquivos

O backend classifica arquivos por extensão nas seguintes categorias:

- Documentos
- Apresentações
- Planilhas
- Imagens
- Design e 3D
- Vídeos
- Áudio
- Compactados
- Bancos de dados
- Código
- Executáveis e instaladores
- Fontes
- Outros

Os arquivos enviados são organizados em pastas por usuário, categoria e mês. O banco registra o nome original, categoria, destino, tamanho, status e data do envio. Um arquivo com nome repetido para a mesma conta é identificado como duplicado; o organizador evita sobrescrever o arquivo existente.

## Estrutura do projeto

```text
file-auth-management-system/
├── backend/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── files.py
│   ├── main.py
│   ├── models.py
│   ├── organizer.py
│   ├── schemas.py
│   └── security.py
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .gitignore
├── requirements.txt
├── LICENSE
└── README.md
```

O banco SQLite e os arquivos enviados são criados localmente e ficam fora do controle de versão.

## Requisitos

- Python 3.10 ou superior.
- Git.
- Conexão com a internet para carregar Chart.js e as fontes externas usadas na interface.

## Instalação no Windows

Abra o terminal na pasta principal do projeto e crie um ambiente virtual:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Configuração da chave JWT

Gere uma chave secreta:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Crie o arquivo `backend/.env` e cole nele a chave gerada:

```env
SECRET_KEY=COLE_A_CHAVE_GERADA_AQUI
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Não compartilhe nem publique o arquivo `.env`. Ele contém a chave usada para assinar os tokens JWT.

## Como executar

Com o ambiente virtual ativo, inicie o servidor a partir da pasta `backend`:

```powershell
cd backend
uvicorn main:app --reload
```

Depois, abra no navegador:

- Aplicação: http://127.0.0.1:8000/app/
- Documentação interativa da API: http://127.0.0.1:8000/docs
- Verificação de saúde: http://127.0.0.1:8000/saude

A página `/` redireciona para a interface em `/app/`.

## Rotas da API

- `GET /saude` — informa se a API está no ar.
- `POST /auth/register` — cria uma conta.
- `POST /auth/login` — autentica e retorna um token JWT.
- `GET /auth/me` — retorna os dados da conta autenticada.
- `POST /files/upload` — envia e organiza um arquivo.
- `GET /files` — lista o histórico da conta autenticada; aceita busca, categoria e limite.

As rotas de arquivos e a rota `/auth/me` exigem autenticação. No envio, o arquivo é recebido como `multipart/form-data` no campo `arquivo`. O login recebe `username` e `password`; o campo `username` aceita o nome de usuário ou o e-mail.

## Fluxo de uso

1. Crie uma conta pela interface.
2. Entre usando e-mail ou nome de usuário e senha.
3. Envie um arquivo pelo seletor ou arraste-o para a área de envio.
4. Confira a categoria, o status e o destino no histórico.
5. Use a busca e o filtro para localizar arquivos.
6. Saia da conta e entre com outro usuário para acessar o histórico separado daquela conta.

## Armazenamento e segurança

- A API limita o tamanho de cada envio a 50 MB.
- Cada registro de arquivo pertence a uma conta de usuário.
- As senhas são armazenadas como hash, nunca como texto puro.
- Os endpoints privados exigem um token JWT válido.
- A chave JWT fica em `backend/.env`, arquivo que não deve ser enviado ao GitHub.
- O banco e os arquivos são armazenados no computador onde o servidor está rodando.

Este projeto é voltado a aprendizado e portfólio. Para disponibilizá-lo em produção, será necessário configurar hospedagem, armazenamento persistente para o banco e os arquivos, e revisar as configurações de segurança do ambiente público.

## Próximos aprimoramentos

- Publicar uma demonstração e adicionar sua URL a este README.
- Criar testes automatizados para autenticação e envio de arquivos.
- Documentar a configuração de produção.
- Preparar imagens do dashboard para apresentar o projeto no portfólio.

## Licença

Consulte o arquivo [`LICENSE`](LICENSE) para ver os termos de uso.