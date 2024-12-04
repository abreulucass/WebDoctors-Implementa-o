(function ($) {
    "use strict";

    // Exibição de mensagem de logout
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'loggedOut') {
        alert('Você saiu da conta com sucesso.');
    }

    /*==================================================================
    [ Validação ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function (event) {
        event.preventDefault(); // Previne o comportamento padrão do formulário

        var check = true;
        var email = $("input[name='email']").val().trim();
        var password = $("input[name='pass']").val().trim();

        // Valida se o email e senha estão preenchidos
        if (!email || !password) {
            showValidate($("input[name='email']"));
            check = false;
        }

        if (check) {
            // Envia a requisição para o servidor de login
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, senha: password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error === 'Conta não encontrada') {
                        alert('A conta não existe.');
                    } else if (data.error === 'Senha incorreta') {
                        alert('Senha incorreta.');
                    } else if (data.success === 'Login bem-sucedido') {
                        if (data.redirect) {
                            console.log('Resposta do servidor:', data);

                            // Armazenar informações no localStorage
                            if (data.id && data.nome) {
                                localStorage.removeItem('idMedico');
                                localStorage.removeItem('nomeMedico');
                                localStorage.setItem('idPaciente', data.id);
                                localStorage.setItem('nomePaciente', data.nome);
                            } else if (data.medicoId && data.medicoNome) {
                                localStorage.removeItem('idPaciente');
                                localStorage.removeItem('nomePaciente');
                                localStorage.setItem('idMedico', data.medicoId);
                                localStorage.setItem('nomeMedico', data.medicoNome);
                            }

                            // Exemplo ao acessar a página do médico
                            if (window.location.pathname === '/medico') {
                                localStorage.removeItem('idPaciente');
                                localStorage.removeItem('nomePaciente');
                            } else if (window.location.pathname === '/paciente') {
                                localStorage.removeItem('idMedico');
                                localStorage.removeItem('nomeMedico');
                            }

                            // Redirecionar para a URL fornecida
                            console.log('Redirecionando para:', data.redirect);
                            window.location.href = data.redirect;
                        } else {
                            alert('URL de redirecionamento inválida.');
                            console.error('URL de redirecionamento não fornecida pelo servidor.');
                        }
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar a requisição de login:', error);
                    alert('Erro ao tentar fazer login. Verifique sua conexão.');
                });
        }
    });

    // Validação do campo de entrada
    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
        return true; // Adicionado retorno explícito
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    // Lógica de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Limpa informações de autenticação
            localStorage.clear();

            // Redireciona para a página de login com mensagem
            window.location.href = '/login.html?message=loggedOut';
        });
    }
})(jQuery);