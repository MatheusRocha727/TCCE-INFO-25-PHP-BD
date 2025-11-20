<?php
// salvar_orcamento.php

// Config de conexão – ajuste se seu ambiente for diferente
$dbHost = 'localhost';
$dbName = 'financias';
$dbUser = 'root';
$dbPass = '';

/**
 * Converte valor no formato brasileiro (1.234,56) para decimal (1234.56)
 */
function brToDecimal(string $valorBr = null): float
{
    $valorBr = trim((string)$valorBr);

    if ($valorBr === '') {
        return 0.0;
    }

    // remove separador de milhar
    $valorBr = str_replace('.', '', $valorBr);
    // troca vírgula por ponto
    $valorBr = str_replace(',', '.', $valorBr);

    return (float)$valorBr;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Se alguém tentar acessar direto, devolve pro formulário
    header('Location: FR_save2.html');
    exit;
}

// Coleta de dados do form
$competencia  = $_POST['competencia']  ?? null;  // formato esperado: YYYY-MM
$rendaBr      = $_POST['renda_mensal'] ?? null;

$tipos        = $_POST['tipo']        ?? [];
$descricoes   = $_POST['descricao']   ?? [];
$valoresBr    = $_POST['valor']       ?? [];

// Validação mínima
if (empty($competencia) || empty($rendaBr)) {
    echo "<script>alert('Competência e renda mensal são obrigatórias.'); window.history.back();</script>";
    exit;
}

// Monta data de referência (1º dia do mês)
$dataCompetencia = $competencia . '-01';

// Converte renda
$renda = brToDecimal($rendaBr);

try {
    // Conexão PDO
    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Inicia transação
    $pdo->beginTransaction();

    /*
     * 1) Inserir RENDIMENTO na tabela receita
     * Tabela EXISTENTE:
     *  receita(id_rec, titulo_rec, valor_rec, dt_recebido, id_pessoa, id_cat)
     */
    $sqlReceita = "INSERT INTO receita (titulo_rec, valor_rec, dt_recebido, id_pessoa, id_cat)
                   VALUES (:titulo_rec, :valor_rec, :dt_recebido, :id_pessoa, :id_cat)";
    $stmtRec = $pdo->prepare($sqlReceita);

    $tituloRec   = 'Renda mensal ' . $competencia;
    $idPessoaRec = null; // não vamos atrelar a uma pessoa específica por enquanto
    $idCatRec    = null; // sem categoria vinculada

    $stmtRec->execute([
        ':titulo_rec'  => $tituloRec,
        ':valor_rec'   => $renda,
        ':dt_recebido' => $dataCompetencia,
        ':id_pessoa'   => $idPessoaRec,
        ':id_cat'      => $idCatRec,
    ]);

    /*
     * 2) Inserir DESPESAS na tabela despesa
     * Tabela EXISTENTE:
     *  despesa(id_desp, nome_desp, valor_desp, valor_pgto, dt_venc, id_pessoa, id_cat)
     */
    $sqlDesp = "INSERT INTO despesa (nome_desp, valor_desp, valor_pgto, dt_venc, id_pessoa, id_cat)
                VALUES (:nome_desp, :valor_desp, :valor_pgto, :dt_venc, :id_pessoa, :id_cat)";
    $stmtDesp = $pdo->prepare($sqlDesp);

    foreach ($descricoes as $i => $descricao) {
        $descricao  = trim((string)$descricao);
        $tipo       = isset($tipos[$i]) ? trim((string)$tipos[$i]) : '';
        $valorLinha = $valoresBr[$i] ?? '';

        // Se linha estiver totalmente vazia, ignora
        if ($descricao === '' && trim((string)$valorLinha) === '') {
            continue;
        }

        $valorDesp = brToDecimal($valorLinha);

        // Campos extras – mantendo estrutura, mas sem forçar vínculo
        $valorPgto  = null;           // ainda não pago
        $dtVenc     = $dataCompetencia;
        $idPessoa   = null;          // sem vínculo a pessoa neste fluxo
        $idCat      = null;          // sem vínculo a categoria (pode ser tratado depois, se quiser)

        $stmtDesp->execute([
            ':nome_desp'  => $descricao,
            ':valor_desp' => $valorDesp,
            ':valor_pgto' => $valorPgto,
            ':dt_venc'    => $dtVenc,
            ':id_pessoa'  => $idPessoa,
            ':id_cat'     => $idCat,
        ]);
    }

    $pdo->commit();

    echo "<script>
            alert('Orçamento gravado com sucesso no banco de dados.');
            window.location.href = 'FR_save2.html';
          </script>";

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Em produção: loga isso, não exibe cru
    $msg = addslashes($e->getMessage());
    echo "<script>
            alert('Erro ao salvar no banco: {$msg}');
            window.history.back();
          </script>";
}







































































// // salvar_orcamento.php

// // CONFIGURAÇÃO DO BANCO (ajuste se necessário)
// $dbHost = 'localhost';
// $dbName = 'piggmoneta';
// $dbUser = 'root';
// $dbPass = '';

// function brToDecimal($valorBr)
// {
//     // Remove espaços
//     $valorBr = trim($valorBr);

//     if ($valorBr === '') {
//         return 0.0;
//     }

//     // Remove separador de milhar (.)
//     $valorBr = str_replace('.', '', $valorBr);
//     // Troca vírgula por ponto
//     $valorBr = str_replace(',', '.', $valorBr);

//     return (float)$valorBr;
// }

// if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
//     header('Location: FR_save2.html');
//     exit;
// }

// $competencia  = $_POST['competencia']  ?? null;
// $rendaBr      = $_POST['renda_mensal'] ?? null;
// $tipos        = $_POST['tipo']        ?? [];
// $descricoes   = $_POST['descricao']   ?? [];
// $valoresBr    = $_POST['valor']       ?? [];

// if (!$competencia || !$rendaBr) {
//     echo "<script>alert('Competência e renda são obrigatórias.'); window.history.back();</script>";
//     exit;
// }

// $renda = brToDecimal($rendaBr);

// try {
//     $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
//     $pdo = new PDO($dsn, $dbUser, $dbPass, [
//         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
//     ]);

//     // Transação para garantir consistência
//     $pdo->beginTransaction();

//     // 1) Inserir o orçamento
//     $sqlOrc = "INSERT INTO orcamentos (competencia, renda_mensal) VALUES (:competencia, :renda)";
//     $stmtOrc = $pdo->prepare($sqlOrc);
//     $stmtOrc->execute([
//         ':competencia' => $competencia,
//         ':renda'       => $renda
//     ]);

//     $orcamentoId = (int)$pdo->lastInsertId();

//     // 2) Inserir as despesas vinculadas
//     $sqlDesp = "INSERT INTO despesas_orcamento (orcamento_id, tipo, descricao, valor)
//                 VALUES (:orcamento_id, :tipo, :descricao, :valor)";
//     $stmtDesp = $pdo->prepare($sqlDesp);

//     foreach ($tipos as $i => $tipo) {
//         $tipo       = trim($tipo ?? '');
//         $descricao  = trim($descricoes[$i] ?? '');
//         $valorLinha = $valoresBr[$i] ?? '';

//         if ($descricao === '' && $valorLinha === '') {
//             // pula linha em branco
//             continue;
//         }

//         $valor = brToDecimal($valorLinha);

//         $stmtDesp->execute([
//             ':orcamento_id' => $orcamentoId,
//             ':tipo'         => $tipo,
//             ':descricao'    => $descricao,
//             ':valor'        => $valor
//         ]);
//     }

//     $pdo->commit();

//     echo "<script>
//             alert('Orçamento salvo com sucesso!');
//             window.location.href = 'FR_save2.html';
//           </script>";

// } catch (PDOException $e) {
//     if (isset($pdo) && $pdo->inTransaction()) {
//         $pdo->rollBack();
//     }

//     // Em produção, logue o erro em vez de exibir:
//     // error_log($e->getMessage());

//     echo "<script>
//             alert('Erro ao salvar no banco: " . addslashes($e->getMessage()) . "');
//             window.history.back();
//           </script>";
// }
