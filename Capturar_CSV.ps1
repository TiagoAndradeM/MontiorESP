param(
    [string]$Porta = 'COM7',
    [ValidateRange(1, 3600)]
    [int]$DuracaoSegundos = 60,
    [string]$Cenario = 'teste'
)

$ErrorActionPreference = 'Stop'
$nomeCenario = ($Cenario.Trim().ToLowerInvariant() -replace '[^a-z0-9_-]+', '_').Trim('_')
if (-not $nomeCenario) { $nomeCenario = 'teste' }

$portas = [System.IO.Ports.SerialPort]::GetPortNames()
if ($Porta -notin $portas) {
    throw "Porta $Porta nao encontrada. Portas disponiveis: $($portas -join ', '). Confira a porta na Arduino IDE."
}

$pastaDados = Join-Path $PSScriptRoot 'dados'
$nomeArquivo = '{0}_{1}.csv' -f $nomeCenario, (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')
$arquivoCsv = Join-Path $pastaDados $nomeArquivo
$serial = [System.IO.Ports.SerialPort]::new($Porta, 115200)
$serial.NewLine = "`n"
$serial.ReadTimeout = 1000
$serial.DtrEnable = $false
$serial.RtsEnable = $false
$writer = $null
$quantidade = 0
$cronometro = [System.Diagnostics.Stopwatch]::new()
$esperaInicial = [System.Diagnostics.Stopwatch]::StartNew()
$padrao = '^RMS_dBFS:\s*(?<rms>-?\d+(?:\.\d+)?)\s+Pico_dBFS:\s*(?<pico>-?\d+(?:\.\d+)?)(?:\s+RMS_filtrado_dBFS:\s*(?<filtrado>-?\d+(?:\.\d+)?)\s+LED:\s*(?<led>VERDE|AMARELO|VERMELHO))?\s*$'

try {
    try {
        $serial.Open()
    }
    catch {
        throw "Nao foi possivel abrir $Porta. Feche o Monitor/Plotter Serial da Arduino IDE e tente novamente. Detalhe: $($_.Exception.Message)"
    }

    Write-Host "Aguardando leituras do ESP32 em $Porta (115200 baud)..."

    while ($true) {
        if ($cronometro.IsRunning -and $cronometro.Elapsed.TotalSeconds -ge $DuracaoSegundos) {
            break
        }
        if (-not $cronometro.IsRunning -and $esperaInicial.Elapsed.TotalSeconds -ge 15) {
            throw 'Nenhuma leitura RMS/Pico recebida em 15 segundos. Confira o sketch, a porta e o baud rate de 115200.'
        }

        try {
            $linha = $serial.ReadLine().Trim()
        }
        catch [System.TimeoutException] {
            continue
        }

        $resultado = [regex]::Match($linha, $padrao)
        if (-not $resultado.Success) { continue }

        if (-not $cronometro.IsRunning) {
            New-Item -ItemType Directory -Path $pastaDados -Force | Out-Null
            $writer = [System.IO.StreamWriter]::new($arquivoCsv, $false, [System.Text.UTF8Encoding]::new($false))
            $writer.WriteLine('horario_local;tempo_ms;cenario;rms_dbfs;pico_dbfs;rms_filtrado_dbfs;led')
            $cronometro.Start()
            Write-Host "Gravando por $DuracaoSegundos segundos em $arquivoCsv"
        }

        $horario = [System.DateTimeOffset]::Now.ToString('o', [System.Globalization.CultureInfo]::InvariantCulture)
        $tempoMs = $cronometro.ElapsedMilliseconds
        $rms = $resultado.Groups['rms'].Value.Replace('.', ',')
        $pico = $resultado.Groups['pico'].Value.Replace('.', ',')
        $filtrado = $resultado.Groups['filtrado'].Value.Replace('.', ',')
        $led = $resultado.Groups['led'].Value
        $linhaCsv = '{0};{1};{2};{3};{4};{5};{6}' -f $horario, $tempoMs, $nomeCenario, $rms, $pico, $filtrado, $led
        $writer.WriteLine($linhaCsv)
        $quantidade++
    }
}
finally {
    if ($null -ne $writer) { $writer.Dispose() }
    if ($serial.IsOpen) { $serial.Close() }
    $serial.Dispose()
}

Write-Host "Concluido: $quantidade leituras salvas em $arquivoCsv"
