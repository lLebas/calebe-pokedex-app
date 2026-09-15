# Pokédex

## Autor
Calebe Xavier — Matrícula 22609882

## Descrição
Aplicação web que consulta a PokeAPI para exibir dados de qualquer Pokémon pelo nome ou número: imagem, tipos, altura, peso e estatísticas base. Nesta etapa, a aplicação ganhou persistência de dados (monte e salve seu time de Pokémon) e passou a rodar em um container Docker publicado no Docker Hub.

## API utilizada
- PokeAPI — https://pokeapi.co/docs/v2
- Endpoint consumido: `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-numero}`

## Funcionalidades
- Buscar um Pokémon pelo nome ou número
- Ver imagem, tipos, altura e peso
- Ver estatísticas base (HP, ataque, defesa, etc.) em barras
- Mensagem amigável quando o Pokémon não é encontrado ou a API está fora do ar
- Adicionar o Pokémon buscado ao **Meu Time** (máx. 6), listar e remover itens do time

## Persistência de dados (Supabase)
- **Banco:** Supabase (PostgreSQL), região South America.
- **Tabela:** `time_pokemon`

  | coluna       | tipo        | descrição                                      |
  |--------------|-------------|-------------------------------------------------|
  | `id`         | uuid (PK)   | gerado automaticamente pelo Supabase             |
  | `criado_em`  | timestamptz | data/hora de inserção (default `now()`)          |
  | `nome_item`  | text        | nome do Pokémon                                  |
  | `dados_extra`| jsonb       | `{ numero, imagem, tipos }` do Pokémon salvo     |

- **O que é salvo:** ao buscar um Pokémon, o botão "Adicionar ao time" grava um registro na tabela acima. A seção "Meu Time" lista os registros ao carregar a página (`SELECT`) e cada item tem um botão de remover (`DELETE`). Os dados sobrevivem ao fechar o navegador, pois vivem no Postgres do Supabase — não em `localStorage`.
- **Limitação conhecida:** as políticas de RLS da tabela estão abertas para o papel `anon` (leitura e escrita liberadas), conforme orientado no roteiro da etapa. Isso é aceitável para este exercício, mas não deveria ir para produção sem autenticação de usuários.
- **Configuração:** a URL e a chave `anon public` do projeto Supabase ficam no topo de `script.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

## Como executar localmente
1. Clone: `git clone https://github.com/lLebas/calebe-pokedex-app.git`
2. Abra o arquivo `index.html` no navegador (ou sirva a pasta com qualquer servidor estático)

## Docker

### Build e execução local
```bash
docker build -t calebe-pokedex-app .
docker run -d -p 8080:80 --name meu-app calebe-pokedex-app
# abra http://localhost:8080
```

### Rodando a partir do Docker Hub (imagem pública)
```bash
docker run -d -p 8080:80 [SEU-USUARIO-DOCKERHUB]/calebe-pokedex-app:1.1
```

## Publicação no Docker Hub
- **Repositório:** https://hub.docker.com/r/[SEU-USUARIO-DOCKERHUB]/calebe-pokedex-app
- **Tags publicadas:** `1.0`, `1.1`, `latest`

## Sidequests
- **SQ1 · `.dockerignore`:** exclui `.git`, `.claude`, arquivos `.md`, `Dockerfile`/`.dockerignore`, logs e afins. Isso mantém a imagem menor (menos camadas e contexto de build) e o `docker build` mais rápido, já que o Docker não precisa copiar/processar arquivos que a aplicação não usa em produção.
- **SQ2 · Versionamento de imagem:** publicadas as tags `1.0` (primeira versão funcional), `1.1` (após a melhoria de persistência/UI do time) e `latest`.
- **SQ3 · Descrição no Docker Hub:** overview preenchido com a descrição da aplicação, o comando `docker run` acima e o link do repositório GitHub.
- **SQ4 · Orquestração:** dois containers rodando em paralelo, portas 8080 e 8081:
  ```bash
  docker run -d -p 8080:80 --name pokedex-1 [SEU-USUARIO-DOCKERHUB]/calebe-pokedex-app:1.1
  docker run -d -p 8081:80 --name pokedex-2 [SEU-USUARIO-DOCKERHUB]/calebe-pokedex-app:1.1
  docker ps
  ```
  Print do `docker ps` com os dois containers: `docs/sq4-docker-ps.png` *(adicionar o print aqui)*.

  **Se eu tivesse 100 containers, como gerenciaria?** Rodar e monitorar 100 containers manualmente (`docker run` um a um, checando saúde e reiniciando os que caem) não escala. É para isso que existe o Kubernetes: ele trata cada container como parte de um **Pod** (a menor unidade que ele agenda), agrupa vários Pods idênticos em um **Deployment** com um número desejado de **réplicas**, e um **cluster** (várias máquinas — nodes) distribui essas réplicas automaticamente entre os nodes disponíveis. Se um Pod cai, o Kubernetes sobe outro no lugar (self-healing); se o tráfego aumenta, dá para escalar o número de réplicas (manual ou automaticamente); e um **Service** dá um endereço estável para acessar qualquer réplica saudável, sem precisar saber em qual node ela está rodando. Ou seja, em vez de eu gerenciar 100 containers um por um, eu descrevo o estado desejado (imagem, réplicas, portas) e o Kubernetes cuida de manter esse estado.

## Links
- **Aplicação no ar (GitHub Pages):** https://lLebas.github.io/calebe-pokedex-app/
- **Repositório:** https://github.com/lLebas/calebe-pokedex-app
- **Imagem no Docker Hub:** https://hub.docker.com/r/[SEU-USUARIO-DOCKERHUB]/calebe-pokedex-app
