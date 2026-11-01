# Plano de coletas nos ambientes — piloto de 3 de novembro de 2026

Este protocolo é para **biblioteca, sala de aula e oficina/laboratório**. Na terça-feira, faça **uma sessão contínua de 10 minutos em cada ambiente**. O objetivo imediato é comparar o comportamento das leituras digitais e testar a coleta. Essa primeira rodada **não basta, sozinha, para treinar ou comprovar um classificador de ambiente**.

## O que será gravado

- Use o ESP32 DevKit V1 com INMP441 e o sketch de LEDs que estiver **realmente carregado e conferido** na placa. Anote o nome do `.ino` e, se possível, sua versão/commit. Não troque sketch, pinos, orientação do microfone nem alimentação entre os três locais.
- O capturador [Capturar_CSV.ps1](../Capturar_CSV.ps1) lê a porta serial a **115200 baud** e salva um CSV por execução em `MontiorESP/dados/`. O arquivo recebe o nome do cenário e a data/hora local: `biblioteca_s01_2026-11-03_HH-mm-ss.csv`, por exemplo.
- As colunas atuais são `horario_local`, `tempo_ms`, `cenario`, `rms_dbfs`, `pico_dbfs`, `rms_filtrado_dbfs` e `led`. As duas últimas ficam vazias com o firmware V02; a V03 as informa. São **indicadores digitais em dBFS, não dB SPL**. O capturador não grava áudio nem palavras das conversas.
- O dashboard ao vivo e o Monitor/Plotter Serial da Arduino IDE devem ficar **fechados** durante cada coleta: só um programa pode abrir a porta COM por vez.

## Antes de sair

1. Carregue o notebook e prepare alimentação USB estável. Leve o mesmo ESP32, INMP441, cabo USB e montagem para os três locais. Evite mexer nos jumpers durante a troca de sala; transporte a protoboard com o USB desligado.
2. Confirme o sketch carregado e a pinagem: microfone SCK→GPIO26, WS→GPIO25, SD→GPIO33; LEDs verde→18, amarelo→19 e vermelho→23. **Não altere L/R para tentar corrigir uma coleta no meio da rodada**: o sketch validado lê o segundo slot I²S e a relação entre L/R e canal ainda precisa ser conferida na bancada.
3. Faça um teste técnico de 30 segundos em local apropriado, usando `-Cenario teste_tecnico`. Confira se o script termina com leituras salvas e se RMS/pico variam com um som normal. Esse arquivo é de diagnóstico e não deve ser rotulado como biblioteca, sala ou oficina.
4. Combine o acesso e uma posição segura em cada local. Não atrapalhe aulas, estudos ou operação de máquinas. O estudo coleta **nível relativo de som**, sem gravar áudio bruto; explique isso se alguém perguntar.

## Posição e sequência em cada ambiente

Use o mesmo suporte/altura aproximada em todos os locais, idealmente sobre uma mesa estável, com o orifício do INMP441 na mesma orientação. Registre a altura e a posição aproximadas. Evite encostar o microfone na mesa, cobri-lo, apontá-lo para uma ventilação forte ou colocá-lo ao lado do notebook/ventoinha. Um ponto representativo do espaço é melhor que ficar colado a uma pessoa ou ferramenta; mantenha essa regra nas repetições.

Chegue, posicione o conjunto, conecte o USB e aguarde o ESP32 iniciar. Só então rode o comando. Deixe as pessoas e atividades seguirem normalmente. **Não provoque palmas, fala de teste ou ruídos artificiais dentro dos 10 minutos**. Anote no registro quando ocorrerem eventos relevantes, como início de aula, conversa em grupo, máquina ligada, porta batendo ou interrupção. Na biblioteca, respeite o silêncio; na oficina, mantenha cabos e notebook afastados das máquinas e siga as regras locais de segurança.

No PowerShell, vá à pasta do projeto:

```powershell
Set-Location 'C:\Users\tiago\OneDrive\Documentos\ChatGPT\TREEINE FALCONS\MontiorESP'
```

Execute **um comando por vez**, aguardando a mensagem `Concluido` antes de deslocar a montagem:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 600 -Cenario biblioteca_s01
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 600 -Cenario sala_aula_s01
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 600 -Cenario oficina_s01
```

Use cada comando **somente no ambiente correspondente**. Se o Windows atribuir outra porta, substitua `COM7` pela porta mostrada na Arduino IDE ou por `[System.IO.Ports.SerialPort]::GetPortNames()` no PowerShell. Se aparecer “porta ocupada”, feche Monitor Serial, Plotter Serial e dashboard. O cronômetro de 600 s começa **na primeira linha válida recebida**, não no instante em que o comando é digitado; se nenhuma leitura chegar em 15 s, o script informa erro.

## Ficha de campo — preencher uma linha para cada CSV

Copie esta tabela para as sessões seguintes. Use apenas códigos para identificar salas, sem nomes de pessoas.

| Campo | Biblioteca s01 | Sala s01 | Oficina s01 |
|---|---|---|---|
| Arquivo CSV completo | | | |
| Data e horário de início/fim | | | |
| Sala/local (código) | | | |
| Sketch carregado e versão | | | |
| Porta COM | | | |
| Posição, altura e orientação do mic | | | |
| Ocupação aproximada e atividade normal | | | |
| Eventos e minuto aproximado | | | |
| Ruído externo/interferência percebida | | | |
| Interrupção, cabo solto ou reinício? | | | |
| Coleta válida? Motivo se não | | | |

## Conferência imediata após cada sessão

1. Confira se apareceu `Concluido: ... leituras salvas em ...csv` e anote o caminho exibido. O CSV fica em `C:\Users\tiago\OneDrive\Documentos\ChatGPT\TREEINE FALCONS\MontiorESP\dados\`.
2. Abra o arquivo e veja se há cabeçalho, muitas linhas e `tempo_ms` avançando até perto de **600000**. Com relatório nominal a cada 4096 amostras a 16 kHz, espera-se aproximadamente **4 linhas por segundo**, ou cerca de **2300 linhas em 10 minutos**; esse número é apenas uma conferência grosseira, não critério de qualidade acústica.
3. Veja se `rms_dbfs` e `pico_dbfs` não ficaram constantes ou vazios. Picos muito próximos de **0 dBFS** podem indicar saturação; anote sua ocorrência. Variação de LED, por si só, não invalida a coleta: seus limiares ainda são experimentais.
4. Se o cabo sair, a placa reiniciar ou a serial falhar, **não una dois pedaços como se fossem uma sessão contínua**. Registre a falha e repita com um novo nome (`_s02` ou `_repeticao`), se houver tempo. Guarde o arquivo incompleto identificado como tal.
5. Copie os arquivos para um backup local confiável. Antes de publicar no GitHub ou compartilhar, revise os nomes, horários e metadados. Os CSVs não contêm áudio bruto, mas o registro de presença/atividade pode ser sensível.

## Depois do piloto: dados para identificação automática

Se o objetivo é reconhecer o **tipo de ambiente**, repita a coleta em pelo menos **três sessões independentes por classe**, em horários e situações diferentes: biblioteca com movimento normal e mais vazia; sala durante aula e atividade em grupo; oficina com máquinas desligadas e em operação habitual. Dez minutos por sessão é um ponto de partida prático, não uma quantidade mínima cientificamente estabelecida. Se possível, inclua **mais de uma sala física por classe**; caso contrário, a conclusão deve se limitar aos três espaços amostrados.

Mantenha o mesmo hardware e método de posicionamento. Registre ocupação e atividade como contexto, mas o **rótulo principal** de cada sessão deve continuar sendo o ambiente real. Para avaliar um futuro modelo, separe sessões inteiras (ou dias/locais inteiros) entre treino e teste; não sorteie janelas vizinhas do mesmo CSV para ambos. As leituras atuais de RMS/pico permitem analisar níveis e dinâmica temporal, mas provavelmente serão insuficientes para distinguir ambientes parecidos. Antes de prometer uma classificação, será necessário estudar recursos adicionais do sinal, como distribuição de frequências, e testar em sessões novas.

Referências metodológicas: [DCASE — classificação de cenas acústicas com dados limitados e dispositivos diferentes](https://dcase.community/challenge2024/task-data-efficient-low-complexity-acoustic-scene-classification) e [scikit-learn — validação com grupos não sobrepostos](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html).
