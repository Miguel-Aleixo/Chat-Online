# 💬 Chat Online

Projeto de chat em tempo real desenvolvido para fins de estudo e prática de desenvolvimento **fullstack moderno**.

## 🚀 Sobre o projeto

Este sistema é um chat online onde usuários podem se comunicar em tempo real através de mensagens, utilizando WebSockets para atualização instantânea.

O objetivo principal é praticar a construção de aplicações completas envolvendo frontend, backend, banco de dados e comunicação em tempo real.

## 🧠 Tecnologias utilizadas

### Frontend

* Next.js
* React
* TypeScript
* API Routes do Next.js

### Backend

* NestJS
* WebSockets (Socket.IO)
* JWT Authentication

### Banco de dados

* PostgreSQL
* Prisma ORM

## ⚙️ Funcionalidades

* Cadastro e login de usuários
* Autenticação com JWT
* Sistema de usuários online
* Envio de mensagens em tempo real
* Comunicação via WebSockets
* Persistência de mensagens no banco de dados

## 📡 Comunicação em tempo real

O chat utiliza WebSockets para permitir que as mensagens sejam enviadas e recebidas instantaneamente, sem necessidade de atualizar a página.

## 🎯 Objetivo do projeto

Este projeto foi desenvolvido com foco em aprendizado, visando melhorar habilidades em:

* Desenvolvimento fullstack
* Arquitetura de sistemas
* Integração entre frontend e backend
* Uso de ORM (Prisma)
* Banco de dados relacional
* Comunicação em tempo real

## 📦 Como executar o projeto

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Banco de dados

Configure o arquivo `.env` no backend com sua conexão PostgreSQL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

Depois rode as migrations:

```bash
npx prisma migrate dev
```

---

## ⚡ Status do projeto

✔ Em desenvolvimento
✔ Funcional para estudos

---

## 📌 Observações

Projeto criado apenas para fins educacionais, podendo sofrer alterações e melhorias constantes.
