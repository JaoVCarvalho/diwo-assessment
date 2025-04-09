# Diwo Backend Assessment - API de Lugares para Conhecer

API desenvolvida em NestJS + TypeORM + MySQL para o desafio de backend da Diwo.
Permite o gerenciamento de **países** e **lugares** a serem visitados, com suporte a operações CRUD e organização por data prevista (meta).

---

## 🔹Descrição Geral

A aplicação oferece duas entidades principais:

- **Countries**: tabela de países com nome e URL da bandeira.
- **Places**: locais que o usuário deseja conhecer, com associação ao país, meta (data) e CRUD completo.

Todas as rotas estão documentadas e uma coleção Postman exportada está disponível na pasta `postman/` na raiz do projeto, pronta para importação.

---

## 🔹 Observações Técnicas

- Foi criada uma entidade `Country` separada para garantir **normalização** e evitar dados duplicados, além de permitir a rota `GET /countries` para população do select no frontend (ordenada alfabeticamente).

- A coluna `meta` em `Place` utiliza o tipo `date` ao invés de colunas separadas para mês e ano, garantindo compatibilidade com operações de ordenação e permitindo futura evolução (ex.: suporte a dia). O dia é fixado em `01` pelo backend e pode ser tratado no frontend.

- Embora não solicitado, foi implementado o **CRUD completo de países** para facilitar testes, populamento em massa (`POST /countries/many`) e manutenção da base.

- O arquivo `.env` foi incluído no repositório propositalmente para facilitar a execução local da aplicação durante a avaliação do desafio técnico. Ele contém apenas configurações genéricas voltadas ao ambiente de desenvolvimento e não expõe dados sensíveis reais.

---

## 🔹 Como Rodar o Projeto (Docker Compose)

O projeto utiliza Docker Compose para subir a API NestJS e o banco MySQL:

```bash
docker-compose up --build
```

> Esse comando inicia dois containers:
> - **mysql-nest**: banco MySQL com o banco `places_db`
> - **nest-api**: aplicação NestJS na porta `3000`

Para acessar o MySQL manualmente:

```bash
docker exec -it mysql-nest mysql -uroot -p
```

A senha do banco está definida no arquivo `.env` na raiz do projeto.

---

## 🔹 Rodar Localmente (sem Docker)

Caso prefira rodar sem Docker:

```bash
npm install
npm run start:dev
```

> Nesse caso, atualize o `.env` com as credenciais e host do **MySQL local**:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_DATABASE=places_db
```

---

## 🔹 Testes Automatizados

O projeto conta com testes unitários focados nas **services**, onde está concentrada a lógica de negócio.

Para rodar os testes:
```bash
npm run test
```

Para visualizar a cobertura de testes:
```bash
npm run test:cov
```

> A cobertura mostra que atingimos **100% de cobertura nas services**, garantindo a confiabilidade da lógica central da aplicação.

---

## 🔹Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) (Node.js Framework)
- [TypeORM](https://typeorm.io/) (ORM)
- [MySQL 8](https://www.mysql.com/)
- [Docker](https://www.docker.com/)
- [Jest](https://jestjs.io/) (Testes)

---

## 🔹 Estrutura de Pastas

```bash
src/
  countries/       # Módulo de países (CRUD completo)
  places/          # Módulo de lugares
  database/        # Migrations (se aplicável)
postman/           # Coleção exportada para teste no Postman
.env               # Configurações sensíveis
Dockerfile         # Build da API
```

---

## 🔹 Endpoints Principais

### Countries
- `GET /countries` → Lista todos os países (ordenados por nome)
- `POST /countries` → Cria um país
- `POST /countries/many` → Cria vários países de uma vez
- `PUT /countries/:id` → Atualiza um país
- `DELETE /countries/:id` → Remove um país

### Places
- `GET /places` → Lista todos os lugares (ordenados por data `meta` ASC)
- `POST /places` → Cria um lugar
- `PUT /places/:id` → Atualiza local e/ou meta
- `DELETE /places/:id` → Remove um lugar

---

## 🔹 Considerações Finais

O projeto foi desenvolvido visando clareza, manutenção e organização do código, com foco em boas práticas backend e cobertura de testes. 

Feedbacks são muito bem-vindos!