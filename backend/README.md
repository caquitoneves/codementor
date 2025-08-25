# 📚 Backend - Plataforma de Mentoria

Este é o backend da plataforma de mentoria, desenvolvido com **NestJS** e **Prisma**.

---

## 🚀 Tecnologias
- [NestJS](https://nestjs.com/) - Framework Node.js
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados
- [JWT](https://jwt.io/) - Autenticação

---

## 📂 Estrutura de Módulos

### **Auth**
- Registro e login de usuários
- Geração e validação de tokens JWT

### **Users**
- Gestão de perfis de usuários (Mentor, Empresa, Admin)

### **Mentors**
- Busca (`/mentors/search`)
- Sugestões (`/mentors/suggestions/:companyId`)
- Destaques (`/mentors/highlighted`)

### **Programs**
- CRUD de programas de mentoria (`/programs`)
- Filtros por empresa, mentor e status
- Contagem de participantes e sessões
- Inclusão de participantes na criação

### **Sessions**
- CRUD de sessões (`/sessions`)
- Vinculação a programas
- Atualização automática de progresso dos participantes

### **Participants**
- CRUD de participantes (`/participants`)
- Progresso, avaliação e conclusão
- Prevenção de duplicidade de inscrição

---

## 🔗 Fluxo Principal
1. **Empresa** encontra mentor (`/mentors/suggestions`)
2. Cria **programa** (`/programs`)
3. Adiciona **participantes** (`/participants` ou direto na criação do programa)
4. Agenda **sessões** (`/sessions`)
5. Marca sessões como concluídas → progresso dos participantes é atualizado
6. Programa finalizado → status `COMPLETED`

---

## ⚙️ Configuração

### 1. Clonar repositório
```bash
git clone <url-do-repo>
cd backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo .env na raiz do backend com o seguinte conteúdo (ajuste conforme seu ambiente):
```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="sua_chave_secreta"
```

### 4. Rodar migrações do Prisma
```bash
npx prisma migrate dev
```

### 5. Rodar servidor em modo desenvolvimento
```bash
npm run start:dev
```

## 📌 Convenções
- **DTOs** para entrada de dados
- **Enums** do Prisma para status
- **Guards** (JwtAuthGuard) para proteger rotas privadas
- **Include** no Prisma para evitar múltiplas queries no frontend

## 📅 Próximos Passos
- Implementar módulo de reviews
- Implementar módulo de pagamentos
- Criar notificações para mentores e empresas