<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>
</head>

<body>
    <div class="wrapper">
        <div class="login-box">
            <form action="" method="POST">
                <h2>CRIAR CONTA</h2>

                <div class="input-box">
                    <input type="text" name="nome" id="usuarioCadastro" required>
                    <label>Nome completo</label>
                </div>

                <div class="input-box">
                    <input type="text" name="usuario" required>
                    <label>Usuário</label>
                </div>

                <div class="input-box">
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>

                <div class="input-box">
                    <input type="password" name="senha" required>
                    <label>Senha</label>
                </div>

                <div class="input-box">
                    <input type="password" name="confirmar" required>
                    <label>Confirmar senha</label>
                </div>

                <div class="input-box">
                    <label for="data">Data de nascimento</label><br>
                    <input type="date" id="data" name="data" required>

                        <script>
                             const hoje = new Date().toISOString().split("T")[0];
                             document.getElementById("data").max = hoje;
                        </script>

                    
                </div>
                <button type="submit" class="btn">Cadastrar</button>

                <div class="registre-link">
                    <button type="button" class="btn" onclick="location.href='login.php'">Voltar</button>
                </div>
            </form>
        </div>
    </div>

</body>

</html>

<?php

require "conexao.php";
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
$nome      = strtoupper($_POST['nome']);
$usuario   = strtoupper($_POST['usuario']);
$email     = $_POST['email'];
$senha     = $_POST['senha'];
$confirmar = $_POST['confirmar'];
$data     = $_POST['data'];

if ($senha !== $confirmar) {
    echo "<script>alert('As senhas não coincidem!'); history.back();</script>";
    exit;
}

$hash = password_hash($senha, PASSWORD_DEFAULT);

$sql = $con->prepare("INSERT INTO pessoa (nome, usuario, email, senha, dt_nasc) VALUES (?, ?, ?, ?, ?)");
$sql->bind_param("sssss", $nome, $usuario, $email, $hash, $data);

if ($sql->execute()) {
    echo "<script>alert('Usuário cadastrado com sucesso!'); window.location.href='login.php';</script>";
} else {
    echo "Erro: " . $sql->error;
}
}
?>
