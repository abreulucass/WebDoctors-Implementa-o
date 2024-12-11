
document.getElementById('userType').addEventListener('change', function() {
    const medicalFields = document.getElementById('medicalFields');
    const crmInput = document.getElementById('crm');
    const especialidadeInput = document.getElementById('especialidade');

    if (this.value === 'medico') {
        medicalFields.style.display = 'block';
        crmInput.required = true;
        especialidadeInput.required = true;
    } else {
        medicalFields.style.display = 'none';
        crmInput.required = false;
        especialidadeInput.required = false;
    }
});

const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const senhaStrength = document.getElementById('senhaStrength');

senhaInput.addEventListener('input', function() {
    const senha = this.value;
    let strength = 0;
    
    if (senha.length >= 8) strength++;
    if (senha.match(/[a-z]+/)) strength++;
    if (senha.match(/[A-Z]+/)) strength++;
    if (senha.match(/[0-9]+/)) strength++;
    if (senha.match(/[$@#&!]+/)) strength++;

    switch(strength) {
        case 0:
        case 1:
            senhaStrength.textContent = 'Senha fraca';
            senhaStrength.style.color = 'red';
            break;
        case 2:
        case 3:
            senhaStrength.textContent = 'Senha média';
            senhaStrength.style.color = 'orange';
            break;
        case 4:
        case 5:
            senhaStrength.textContent = 'Senha forte';
            senhaStrength.style.color = 'green';
            break;
    }
});

document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (senhaInput.value !== confirmarSenhaInput.value) {
        alert('As senhas não coincidem!');
        return;
    }

    const formData = new FormData(this);
    const userData = Object.fromEntries(formData.entries())
    console.log(userData)
    try {
        const response = await fetch('/registeruser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Erro ao se comunicar com o servidor.');
        }

        const data = await response.json();

        console.log(data)

        if (data.error) {
            alert(data.error);
        } else if (data.success) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = "http://localhost:3000/";
        } else {
            alert(data.message || 'Erro desconhecido.');
        }
    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    }    
});

document.getElementById('telefone').addEventListener('input', function(e) {
    let telefone = e.target.value.replace(/\D/g, '');
    telefone = telefone.replace(/^(\d{2})(\d)/g, "($1) $2");
    telefone = telefone.replace(/(\d{4})(\d)/, "$1-$2");
    telefone = telefone.replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3");
    e.target.value = telefone;
});