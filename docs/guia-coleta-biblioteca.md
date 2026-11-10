# Guia rápido — coleta de 10 minutos na biblioteca

Use a branch [`feat/mvp-interface-simulada`](https://github.com/TiagoAndradeM/MontiorESP/tree/feat/mvp-interface-simulada) do repositório público. O capturador [Capturar_CSV.ps1](../Capturar_CSV.ps1) roda **no computador com Windows**; ele não é um sketch para colar na Arduino IDE. A placa precisa estar com o firmware de aquisição já carregado. O sketch V02 de referência está em [Monitor_Poluicao_Sonora_V02_Leds.ino](../Monitor_Poluicao_Sonora_V02_Leds/Monitor_Poluicao_Sonora_V02_Leds.ino).

## Preparação

1. Na página da branch, clique em **Code → Download ZIP**, extraia o arquivo e abra a pasta extraída. Quem usa Git pode executar `git clone --branch feat/mvp-interface-simulada --single-branch https://github.com/TiagoAndradeM/MontiorESP.git`.
2. Use o **mesmo ESP32 e INMP441 já testados pela equipe**, preferencialmente sem alterar a montagem nem reenviar o sketch. Se a placa ainda não estiver programada, abra o `.ino` indicado acima na Arduino IDE, confirme placa, porta e ligações com a equipe e faça um teste curto de RMS/pico antes da coleta.
3. Conecte o ESP32 por USB. Feche o **Monitor Serial**, **Plotter Serial** e qualquer dashboard/capturador que esteja usando a porta. Abra a pasta do projeto no Explorador de Arquivos, clique na barra de endereço, digite `powershell` e pressione Enter. O PowerShell abrirá diretamente nessa pasta.
4. Descubra a porta atribuída ao ESP32:

```powershell
[System.IO.Ports.SerialPort]::GetPortNames()
```

## Teste técnico e coleta

Substitua `COM7` pela porta encontrada. Faça primeiro 30 segundos de teste; verifique se aparece `Concluido` e um arquivo na pasta `dados`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 30 -Cenario biblioteca_teste
```

Depois, posicione o microfone em uma mesa estável na área normal de estudo, afastado de pessoas, portas, ventiladores e do notebook. Mantenha a mesma orientação usada nas outras coletas; anote posição, horário, movimento no local e ruídos externos. Não crie palmas ou conversas artificiais durante a amostra e respeite as regras de silêncio da biblioteca. Inicie a sessão principal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 600 -Cenario biblioteca_s01
```

Deixe a janela aberta até aparecer `Concluido`. O arquivo será criado automaticamente em **`dados/biblioteca_s01_<data-hora>.csv`**, dentro da pasta extraída do projeto. O cronômetro começa na primeira linha válida recebida do ESP32.

## Conferência e envio à equipe

- O CSV deve ter cabeçalho, aproximadamente **2.300 linhas** e `tempo_ms` final perto de **600000**. Os valores de `rms_dbfs` e `pico_dbfs` devem variar. Com o sketch V02, as colunas `rms_filtrado_dbfs` e `led` ficam vazias; isso é esperado.
- Se a porta estiver ocupada, feche Monitor/Plotter Serial e dashboard. Se a porta mudou ao reconectar, repita o comando de listagem. Se o cabo desconectar ou a sessão parar antes de 10 minutos, guarde o arquivo incompleto e faça outra sessão com um nome novo (`biblioteca_s02`), sem juntar os trechos.
- Envie à equipe **o CSV e as anotações da sessão**. Não publique o arquivo diretamente no repositório público antes da revisão do grupo.
- Esses números são **dBFS, relativos ao limite digital**, e não dB SPL calibrados. O CSV contém resumos de janelas de áudio; ele não grava o áudio bruto nem o conteúdo das conversas.

O [plano completo de testes](plano-coletas-ambientes-2026-11-03.md) traz a ficha de campo e o procedimento para sala de aula, biblioteca e oficina.
