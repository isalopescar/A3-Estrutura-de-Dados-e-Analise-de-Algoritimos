## Integrantes do Grupo

- Isadora Lopes Carneiro – RA: 12724112679 / fez o Complexo.js, corrigiu e aprimorou o Tokenizer.js, Parser.js e Index.js, realizou testes finais, revisou o readme/relatório;
- João Luiz Nunes Neto - RA: 12724114136 / fez o Tokenizer.js e ajudou a montar o readme/relatório
- Vinicius dos Santos Santana - RA: 12724121934 / fez o Index.js e função avaliar() do Parser.js
- Lucas Gaspar Vieira - RA: 12724136365 / fez o Parser.js e ajudou a montar o redme/relatório

## Descrição do Projeto

O nosso projeto referente à A3 da UC Estrutura de Dados e Análise de Algoritmos é uma aplicação desenvolvida em JavaScript (Node.js) que funciona como um interpretador algorítmico capaz de ler, processar e resolver expressões matemáticas envolvendo Números Complexos.

Diferente de calculadoras comuns, este projeto implementa uma arquitetura de compilador simplificado, dividindo a responsabilidade em camadas lógicas para garantir a precedência correta de operações e a manipulação de estruturas de dados customizadas.

## Funcionalidades Principais

- **Interface de Linha de Comando (CLI)**: Interação direta via terminal.
- **Tokenizer (Analisador Léxico)**: Converte a string de entrada em tokens processáveis.
- **Parser (Analisador Sintático)**: Interpreta a ordem das operações respeitando a hierarquia matemática.
- **Estrutura de Dados Complexa**: Classe própria para manipulação de partes reais e imaginárias.
- **Operações Aritméticas**: Operações binárias e unárias de números complexos.
- **Suporte a Expressões**: Uso de parênteses e operadores encadeados (ex: `(2+i) * (3-i)`).

## Tecnologias Utilizadas

- **Linguagem**: JavaScript
- **Runtime**: Node.js
- **Controle de Versão**: Git

## Pré-requisitos

Antes de iniciar, certifique-se que possui o `Node.js` instalado.:

## Execução do Projeto

Após extrair o arquivo `A3-Estrutura-de-Dados-e-Analise-de-Algoritimos.zip`, você terá a seguinte estrutura de pastas:

```
ALGORTIMOS E ESTRUTURAS DE DADOS
│
├── src
│   ├── cli
│   │   └── Index.js
│   ├── complexo
│   │   └── Complexo.js
│   ├── parser
│   │   └── Parser.js
│   └── tokenizer
│       └── Tokenizer.js
│
├── tests
│   ├── node tests/complexo.test.js
│   ├── node tests/integration.test.js
│   ├── node tests/parser.test.js
│   └── node tests/tokenizer.test.js
│
├── .gitignore
├── package.json
└── README.md
```

Entre na pasta raiz do projeto via terminal:

```Bash

cd A3-Estrutura-de-Dados-e-Analise-de-Algoritimos
```

Este projeto não possui divisão Frontend/Backend via navegador, ele roda nativamente no console.

Para rodar o interpretador e começar a calcular:

```Bash
node src/cli/Index.js "expressao"
```

Substitua `expressao` com a expressão que queira resolver. Exemplo de entrada: `3 + 4i + (1 - i)`.

O projeto conta com 4 arquivos de teste. Para executá-los e garantir que a lógica está correta:

```Bash
node tests/complexo.test.js
node tests/integration.test.js
node tests/parser.test.js
node tests/tokenizer.test.js
```

Isso rodará os testes e exibirá o status de aprovação das funcionalidades implementadas.

## Conclusão

Este projeto aplica conceitos fundamentais de Estrutura de Dados e Análise de Algoritmos para criar uma ferramenta de cálculo científico. A separação entre Tokenizer, Parser e a classe Complexo demonstra a aplicação prática de modularização e lógica de programação orientada a objetos.
