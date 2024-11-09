# 📚 Sistema de Gerenciamento de Biblioteca - Bibliotech

Bem-vindo ao **Bibliotech**, um sistema de gerenciamento de bibliotecas desenvolvido para facilitar a administração de livros, autores, usuários e empréstimos. Este projeto foi criado como Trabalho de Conclusão de Curso (TCC), com o objetivo de proporcionar uma interface intuitiva e funcionalidades essenciais para o gerenciamento eficiente de uma biblioteca.

## 📖 Índice
- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🌟 Sobre o Projeto
O **Bibliotech** foi desenvolvido para ajudar bibliotecas na organização de seus acervos e na gestão de empréstimos e devoluções de livros. O sistema permite que administradores tenham controle total sobre os registros e usuários, enquanto usuários comuns podem buscar livros e solicitar empréstimos.

## ⚙️ Funcionalidades

### 🔖 Administração de Livros
- Cadastrar, editar e excluir livros.
- Controlar a disponibilidade dos exemplares.

### ✒️ Gerenciamento de Autores
- Adicionar e editar informações sobre autores.
- Associar autores aos livros cadastrados.

### 📅 Controle de Empréstimos
- Registrar e monitorar os empréstimos de livros.
- Gerenciar datas de vencimento e devolução de exemplares.

### 👤 Gestão de Usuários
- Controle de usuários com diferentes níveis de permissão:
  - **Administrador**: Acesso total para gerenciar usuários, livros e empréstimos.
  - **Usuário Regular**: Pode buscar livros e solicitar empréstimos.

### 📊 Relatórios
- Geração de relatórios sobre a utilização do acervo, livros mais populares, entre outros dados importantes para o administrador.

## 🛠 Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Authentication e Firestore
- **Outros**: React, TypeScript, SQL para consultas e relatórios

## 📝 Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- [Firebase CLI](https://firebase.google.com/docs/cli) configurado para gerenciar autenticação e banco de dados.
- Conta no [Firebase](https://firebase.google.com/) para configurar os serviços de autenticação e Firestore.

## 🚀 Instalação

Siga o passo a passo abaixo para rodar o projeto localmente.

1. **Clone este repositório**:

    ```bash
    git clone https://github.com/Llangraff/Bibliotech.git
    ```

2. **Navegue até o diretório do projeto**:

    ```bash
    cd Bibliotech
    ```

3. **Instale as dependências**:

    ```bash
    npm install
    ```

4. **Configure o Firebase**:
   - No Firebase, crie um novo projeto e habilite **Authentication** e **Firestore Database**.
   - Configure as credenciais do Firebase no projeto, criando um arquivo `.env` com as seguintes variáveis:

     ```env
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```

5. **Inicie o servidor**:

    ```bash
    npm start
    ```

6. **Acesse a aplicação**:
   - Abra o navegador e vá para `http://localhost:3000`.

## 💻 Uso

- **Administradores**: Podem fazer login e acessar todas as funcionalidades do sistema, incluindo o gerenciamento de usuários, livros e empréstimos.
- **Usuários Regulares**: Podem se autenticar, visualizar o catálogo de livros e solicitar empréstimos.

Para mais detalhes, veja a [documentação da interface](#estrutura-do-projeto).

## 📂 Estrutura do Projeto

Abaixo, uma visão geral da estrutura de pastas e arquivos do projeto:

```plaintext
Bibliotech/
├── public/                 # Arquivos públicos e estáticos
├── src/                    # Código-fonte do projeto
│   ├── components/         # Componentes reutilizáveis do React
│   ├── pages/              # Páginas principais do sistema
│   ├── services/           # Integração com Firebase e outros serviços
│   ├── utils/              # Funções utilitárias e helpers
│   └── App.tsx             # Componente principal da aplicação
├── .env                    # Variáveis de ambiente do Firebase
├── package.json            # Dependências e scripts do projeto
└── README.md               # Documentação do projeto

🤝 Contribuição
Contribuições são bem-vindas! Para contribuir com o projeto:

Faça um fork do repositório.
Crie uma branch com a sua feature: git checkout -b minha-feature.
Commit as mudanças: git commit -m 'Adiciona nova funcionalidade'.
Faça o push para a branch: git push origin minha-feature.
Abra um Pull Request para revisão.
📜 Licença
Este projeto está sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

