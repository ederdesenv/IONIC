# Implementação do Ionic no Desenvolvimento de um aplicativo de gestão de Tarefas

## Sobre o projeto

Este projeto tem como objetivo atender a atividade avaliativa da disciplina de Desenvolvimento Mobile II do curso de Pos Graduação Latu Sensu em Desenvolvimento Web e Mobile - INSTITUTO FEDERAL SUDESTE DE MG - CAMPUS RIO POMBA.

## Arquitetura: Ionic + Angular + Capacitor + SQLite

## 🏗️ Camadas da Arquitetura

### 1. IONIC — O que o usuário vê (Interface do Usuário / UI)
Esta camada é responsável pela renderização dos componentes visuais e pela experiência do usuário:
* **HomePage (`page.ts` / `page.html`)**: Estrutura principal da tela.
* **Barra verde TO-DO!**: Cabeçalho visual da aplicação.
* **Lista + Checkbox (`ion-list` / `ion-checkbox`)**: Exibição dos itens e seus status de conclusão.
* **Botão `+` (`ion-fab` / `ion-button`)**: Ação para adicionar novas tarefas.
* **AlertController**: Caixa de diálogo nativa/UI para criar ou editar tarefas.

---

### 2. ANGULAR — Quando criar / editar (Lógica de Negócios)
Esta camada captura os eventos disparados na UI e processa as regras de negócio:
1. **Clique / `ionChange`**: Eventos acionados pelas interações do usuário.
2. **`presentAddAlert()`**: Dispara o alerta para inclusão ou edição.
3. **`toggleDone()`**: Trata a alteração de status (marcar/desmarcar tarefa).
4. **`saveEdit()`**: Processa e valida o salvamento do item.
5. **`TodoService`**: Serviço Angular (`create` / `update`) responsável por preparar os dados para persistência via SQL.

---

### 3. CAPACITOR + SQLITE — Onde gravar (Persistência de Dados)
Camada híbrida que gerencia o armazenamento persistente dependendo da plataforma de execução:
* **`getPlatform()`**: Determina a plataforma atual de execução.
* **Web**: Se executado no navegador, utiliza o plugin **`jeep-sqlite`** gravando via **IndexedDB**.
* **Android / iOS**: Se executado em dispositivos móveis, utiliza o **SQLite nativo** através dos plugins nativos do **Capacitor**.

---

## 🔄 Resumo do Fluxo Sintético

```text
👁️ Ionic desenha  ➔  ⚡ Angular reage  ➔  🔀 Capacitor escolhe  ➔  💾 SQLite grava
```

1. **Ionic desenha** os componentes na tela.
2. **Angular reage** às ações do usuário e executa a lógica do serviço.
3. **Capacitor escolhe** a plataforma (Web vs Mobile Nátivo).
4. **SQLite grava** a informação no banco de dados apropriado.

## Sistema Ionic TODO 
O app é uma lista de tarefas (CRUD) feita com **Ionic 8 + Angular 20 (standalone) + Capacitor 7**. Os dados ficam em **SQLite**. No celular o plugin usa o SQLite nativo; no navegador ele simula o mesmo banco com **jeep-sqlite** (sql.js + WASM) e persiste no **IndexedDB**.

O Angular sobe um shell Ionic com uma rota lazy para `HomePage`; a página só desenha e dispara eventos; o `TodoService` abre o SQLite (nativo ou jeep-sqlite no web), garante a tabela `todos` e traduz cada clique em SQL parametrizado, persistindo no IndexedDB quando a plataforma é `web`.
