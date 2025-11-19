<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <link rel="shortcut icon" href="WhatsApp Image 2025-11-03 at 19.12.50.jpeg" type="image/x-icon">
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
                <h2>INSIRA SUA CONTA</h2>

                <div class="input-box">
                    <input type="text" name="usuario" required>
                    <label>Usuário</label>
                </div>

                <div class="input-box">
                    <input type="password" name="senha" required>
                    <label>Senha</label>
                </div>

                <div class="remember-forgot">
                    <label><input type="checkbox" id="label"> Lembrar de mim </label><br>
                </div>

                    <button type="submit" class="btn"
                        onclick="location.href='Finanças_Residenciais_save2.html'">Entrar</button><br>

                    <div>
                        <center><a href="#">Esqueceu a senha?</a><br><br></center>
                    </div>

                    <div class="registre-link">
                       <center><h6>Criar conta</h6></center>
                        <br>
                        <button type="button" class="btn" onclick="location.href='sequencia.html'">Cadastre-se</button>
                    </div>
        </div>
    </div>

    </form>


</body>

</html>

<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    require "conexao.php";
    
    $usuario = $_POST['usuario'];
    $senha   = $_POST['senha'];
    
    $sql = $con->prepare("SELECT * FROM usuarios WHERE usuario = ?");
    $sql->bind_param("s", $usuario);
    $sql->execute();
    
    $result = $sql->get_result();
    
    if ($result->num_rows === 1) {
        
        $user = $result->fetch_assoc();
        
        if (password_verify($senha, $user['senha'])) {
            
            $_SESSION['usuario'] = $user['usuario'];
            $_SESSION['cargo']   = $user['cargo'];
            
            header("Location: Finanças_Residenciais_save2.html");
            exit;
            
        } else {
            echo "<script>alert('Senha incorreta!'); window.location.href='login.html';</script>";
        }
        
    } else {
        echo "<script>alert('Usuário não encontrado!'); window.location.href='login.html';</script>";
    }
}
?>
