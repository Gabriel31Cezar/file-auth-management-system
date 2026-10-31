# File & Auth Management System

Aplicação web de portfólio que reúne autenticação de usuários e organização de arquivos. A pessoa usuária cria uma conta, entra com um token JWT, envia arquivos e acompanha a organização pelo dashboard.

> **Status:** aplicação integrada para execução local. Uma URL pública de demonstração ainda não foi configurada.

## Objetivo

O objetivo do projeto é combinar, em uma única aplicação web, uma API de autenticação de usuários com um organizador de arquivos por categoria e data.

O frontend usa HTML, CSS e JavaScript puro, sem React. O backend usa FastAPI. O gráfico do dashboard usa Chart.js carregado por CDN, sem chave de API.

## Processo de desenvolvimento

Desenvolvi o projeto em etapas no PyCharm, acompanhando a implementação de cada parte:

1. Defini o objetivo e os recursos principais da aplicação.
2. Configurei o ambiente Python e iniciei a API com FastAPI.
3. Implementei cadastro, login, hash de senhas e autenticação JWT.
4. Adicionei o banco SQLite e os modelos para usuários e arquivos.
5. Desenvolvi o organizador por categoria e data, com proteção contra sobrescrita.
6. Criei a interface de login, cadastro e dashboard com HTML, CSS e JavaScript.
7. Conectei a interface à API para autenticação, envio de arquivos e consulta ao histórico.

## Funcionalidades

| Área | Funcionalidade |
| --- | --- |
| Contas | Cadastro com e-mail, nome de usuário e senha. |
| Autenticação | Login com e-mail ou nome de usuário e token JWT. |
| Segurança | Hash de senhas e proteção de rotas privadas. |
| Upload | Seleção de arquivos ou envio por arrastar e soltar. |
| Organização | Classificação por extensão, categoria e mês. |
| Duplicados | Identificação de nomes repetidos e prevenção de sobrescrita. |
| Histórico | Registros separados por usuário, com busca e filtro. |
| Dashboard | Contagem de arquivos, espaço ocupado e categoria mais ativa. |
| Aparência | Gráfico de categorias e tema claro ou escuro. |

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Python, FastAPI e Uvicorn. |
| Dados | SQLAlchemy e SQLite. |
| Validação | Pydantic e `email-validator`. |
| Autenticação | JWT com PyJWT e hash de senhas com `pwdlib`. |
| Frontend | HTML, CSS e JavaScript puro. |
| Gráfico | Chart.js. |

## Categorias de arquivos

| Categoria | Exemplos de extensões |
| --- | --- |
| Documentos | PDF, DOCX, TXT, ODT, MD |
| Apresentações | PPTX, PPT, ODP |
| Planilhas | XLSX, XLS, CSV, TSV |
| Imagens | JPG, PNG, GIF, SVG, WEBP, RAW |
| Design e 3D | PSD, AI, DWG, STL, OBJ, BLEND |
| Vídeos | MP4, MOV, AVI, MKV, WEBM |
| Áudio | MP3, WAV, FLAC, OGG, M4A |
| Compactados | ZIP, RAR, 7Z, TAR, GZ |
| Bancos de dados | SQL, DB, SQLITE, MDB |
| Código | JS, TS, PY, HTML, CSS, JAVA, JSON |
| Executáveis e instaladores | EXE, MSI, APK, DEB, ISO |
| Fontes | TTF, OTF, WOFF, WOFF2 |
| Outros | Extensões não classificadas nas categorias anteriores |

Os arquivos ficam organizados por usuário, categoria e mês da data do arquivo. Quando um nome já existe no destino, o sistema escolhe outro nome para evitar sobrescrever o arquivo. Um envio com o mesmo nome original para a mesma conta é identificado como duplicado no histórico.

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
│   ├── security.py
│   └── teste_organizer.py
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .gitignore
├── requirements.txt
├── LICENSE
└── README.md
```

O banco de dados local é criado em `backend/app.db`. Os arquivos enviados ficam em `backend/storage/`. Esses dados locais são ignorados pelo Git.

## Requisitos

- Python 3.10 ou superior.
- Git.
- Conexão com a internet para carregar Chart.js e as fontes externas da interface.

## Instalação no Windows

Abra um terminal na pasta principal do projeto e crie um ambiente virtual:

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

Não compartilhe nem envie o arquivo `.env` ao GitHub. Ele contém a chave secreta usada para assinar os tokens JWT.

## Como executar

Com o ambiente virtual ativo, inicie o servidor a partir da pasta `backend`:

```powershell
cd backend
uvicorn main:app --reload
```

A aplicação e a documentação ficam disponíveis em:

- Interface web: http://127.0.0.1:8000/app/
- Documentação interativa da API: http://127.0.0.1:8000/docs
- Verificação de saúde: http://127.0.0.1:8000/saude

A rota `/` redireciona para `/app/`.

## Rotas da API

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/` | Público | Redireciona para a interface web. |
| GET | `/app/` | Público | Abre o frontend. |
| GET | `/saude` | Público | Informa se a API está no ar. |
| POST | `/auth/register` | Público | Cria uma conta. |
| POST | `/auth/login` | Público | Autentica e retorna um token JWT. |
| GET | `/auth/me` | JWT | Retorna os dados da conta autenticada. |
| POST | `/files/upload` | JWT | Recebe e organiza um arquivo. |
| GET | `/files` | JWT | Lista o histórico da conta autenticada. |

O envio usa `multipart/form-data` no campo `arquivo`. O login recebe `username` e `password`; `username` aceita o nome de usuário ou o e-mail. A rota de histórico aceita os parâmetros `busca`, `categoria` e `limite`.

## Fluxo de uso

1. Crie uma conta pela interface.
2. Entre com e-mail ou nome de usuário e senha.
3. Envie arquivos pela área de upload.
4. Confira a categoria, o status e o destino no histórico.
5. Use a busca e o filtro para localizar arquivos.
6. Saia e entre com outra conta para acessar o histórico separado dela.

## Segurança e armazenamento

- As senhas são armazenadas como hash, não como texto puro.
- As rotas privadas exigem um token JWT válido.
- Cada registro de arquivo pertence a uma conta.
- O tamanho máximo por envio é 50 MB.
- A chave JWT é carregada de `backend/.env`.
- Banco e arquivos são armazenados localmente no computador que executa o servidor.
- O token da interface fica em `sessionStorage` durante a sessão do navegador.

Este projeto foi desenvolvido para aprendizado e portfólio. Antes de uma publicação para uso real, é necessário configurar hospedagem e armazenamento persistente para o banco e os arquivos, além de revisar as configurações de segurança do ambiente público.

## Próximas melhorias

- Publicar uma demonstração e adicionar a URL aqui.
- Criar testes automatizados para autenticação, envio e separação de arquivos por usuário.
- Documentar a configuração de produção.
- Adicionar imagens do dashboard para apresentação no portfólio.

## Licença

Consulte o arquivo [`LICENSE`](LICENSE) para conhecer os termos de uso.