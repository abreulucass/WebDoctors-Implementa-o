(function () {
  /* Chama a função para carregar as consultas na página principal da página do paciente/medico.*/
  document.addEventListener('DOMContentLoaded', () => {
    const idMedico = localStorage.getItem('idMedico');
    if (idMedico) {
      carregarConsultasMedico(); // Chama a função ao carregar a página
    } else {
      alert('Usuário não autenticado. Faça login novamente.');
      window.location.href = '/login'; // Redireciona para o login, se necessário
    }
  });
  /*==============================================================================*/

  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

// ===================================================== MÉDICO ===========================================================

async function carregarConsultasMedico() {
  const medicoId = localStorage.getItem('idMedico'); // Certifique-se de que o pacienteId está no localStorage
  console.log("ID DO MEDICO:", medicoId);
  if (!medicoId) {
    alert("Medico não identificado. Faça login novamente.");
    window.location.href = "/login"; // Redireciona para o login se não encontrar o pacienteId
    return;
  }
  console.log("PASSOU DO IF");
  try {
    // Faz a requisição para o backend para buscar as consultas
    console.log("ENTROU NO TRY");
    const response = await fetch(`medicos/consultas/medico/${medicoId}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar consultas.");
    }
    console.log("PASSOU DO IF (!response.ok)");

    const consultas = await response.json();
    console.log("Consultas recebidas:", consultas); // Verifique se as consultas são retornadas corretamente
    preencherConsultasMedico(consultas); // Passa as consultas para a função preencher
  } catch (error) {
    console.error("Erro ao carregar consultas:", error);
    //alert("Erro ao carregar consultas. Tente novamente mais tarde.");
  }
}

// ===========================================================================================================================

async function cancelarConsultaMedico(idConsulta, consultaElement) {
  const confirmar = confirm("Você realmente deseja cancelar esta consulta?");
  if (!confirmar) return; // Usuário cancelou a confirmação

  try {
    // Enviar solicitação DELETE para o backend
    const response = await fetch(`/consultas/${idConsulta}`, { method: 'DELETE' });

    if (response.ok) {
      alert("Consulta cancelada com sucesso!");

      // Remove a consulta do DOM
      if (consultaElement) {
        consultaElement.remove();
      }

      // Verifica se ainda há consultas e exibe/esconde mensagens
      const consultasContainer = document.getElementById("consultas-container");
      const semConsultasMsg = document.getElementById("sem-consultas");
      if (consultasContainer && consultasContainer.children.length === 0) {
        semConsultasMsg.classList.remove('d-none');
        consultasContainer.classList.add('d-none');
      }
    } else {
      alert("Erro ao cancelar consulta. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    alert("Erro ao cancelar consulta. Tente novamente mais tarde.");
  }
}

// ===========================================================================================================================

async function carregarHorariosRemarcar(medicoId) {
  try {
    const response = await fetch(`/medicos/horarios?medicoId=${medicoId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar horários');
    }
    const horarios = await response.json();
    console.log('Horários recebidos:', horarios); // Debug

    const horarioSelect = document.getElementById("horarioRemarcar");
    horarioSelect.innerHTML = '<option value="" disabled selected>Selecione um horário</option>';

    horarios.forEach(horario => {
      if (horario.status === 'disponível') {
        const horarioLocal = new Date(horario.dataHora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        const option = document.createElement('option');
        option.value = new Date(horario.dataHora).toISOString();
        option.textContent = horarioLocal;
        horarioSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar horários no modal de remarcar:', error);
    alert('Erro ao carregar horários no modal de remarcar consulta');
  }
}

// Função para abrir o modal e carregar as consultas
async function openRemarcarModalMedico(idConsulta) {
  console.log("Abrindo modal para consulta com ID:", idConsulta);

  try {
    const response = await fetch(`/consultas/${idConsulta}`);
    if (!response.ok) throw new Error("Erro ao buscar a consulta.");

    const consulta = await response.json();
    console.log("Consulta recebida:", consulta);

    // Criar e exibir modal
    const modalContainer = document.createElement("div");
    modalContainer.classList.add("modal", "modal-remarcar");
    modalContainer.innerHTML = `
      <div class="modal-content">
        <span class="close-btn" id="close-remarcar-modal">&times;</span>
        <h2>Remarcar Consulta</h2>
        <input type="hidden" id="idConsulta" value="${consulta._id}">
        <label for="especialidade">Paciente:</label>
        <input type="text" id="nomePaciente" value="${consulta.nomePaciente || 'Nome Paciente não informada'}" disabled>
        <label for="horarioRemarcar">Novo Horário:</label>
        <select id="horarioRemarcar" name="horarioRemarcar">
          <option value="" disabled selected>Selecione um horário</option>
        </select>
        <button onclick="remarcarConsultaMedico()">Confirmar</button>
      </div>
    `;
    document.body.appendChild(modalContainer);

    // Exibir o modal
    modalContainer.style.display = "flex";

    // Adicionar evento para fechar modal
    document.getElementById("close-remarcar-modal").onclick = closeRemarcarModal;

    // Aguarde um pequeno intervalo para garantir que o modal foi renderizado
    setTimeout(async () => {
      const horarioSelect = document.getElementById("horarioRemarcar");

      if (horarioSelect) {
        console.log("Elemento select encontrado, carregando horários...");
        await carregarHorariosRemarcar(consulta.medicoId._id); // Certifique-se de que o ID do médico é válido
      } else {
        console.error("Elemento select 'horarioRemarcar' não encontrado no DOM.");
      }
    }, 50);

  } catch (error) {
    console.error("Erro ao abrir modal de remarcar consulta:", error);
    alert("Erro ao abrir modal de remarcar consulta.");
  }
}

async function remarcarConsultaMedico() {
  const idConsulta = document.getElementById("idConsulta").value;
  const novoHorario = document.getElementById("horarioRemarcar").value; // Certifique-se de que o horário está no formato correto

  console.log('ID da Consulta:', idConsulta);
  console.log('Novo Horário:', novoHorario);

  if (!idConsulta || !novoHorario) {
    alert('Selecione um horário disponível.');
    return;
  }

  try {
    const response = await fetch(`/consultas/remarcar/${idConsulta}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novoHorario }) // Certifique-se de enviar o horário corretamente
    });

    if (response.ok) {
      alert('Consulta remarcada com sucesso!');
      closeRemarcarModal();
      carregarConsultasMedico(); // Atualiza a lista de consultas do paciente
    } else {
      const error = await response.text();
      alert(`Erro ao remarcar consulta: ${error}`);
    }
  } catch (error) {
    console.error('Erro ao remarcar consulta:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

// Função para fechar modal de remarcar consulta
function closeRemarcarModal() {
  const modalContainer = document.querySelector(".modal-remarcar");
  if (modalContainer) {
    modalContainer.remove(); // Remove o modal do DOM
    console.log('Modal fechado e removido do DOM');
  }
}

// ===========================================================================================================================

function openCriarReceitaModal(consultaId, pacienteNome) {

  console.log('ID da Consulta:', consultaId);
  console.log('Nome do paciente:', pacienteNome);
  // Referência ao modal
  const modal = document.getElementById('modal-receita');

  // Preenche os campos com informações da consulta
  document.getElementById('paciente-receita').innerText = `Paciente: ${pacienteNome}`;
  document.getElementById('consulta-id').value = consultaId;

  // Abre o modal
  modal.classList.add('show');
  modal.style.display = 'block';
}

async function enviarReceita(event) {
  event.preventDefault();

  const consultaId = document.getElementById('consulta-id').value;
  const medicamento = document.getElementById('medicamento').value;
  const dosagem = document.getElementById('dosagem').value;
  const instrucoes = document.getElementById('instrucoes').value;

  const receita = {
    consultaId,
    medicamentos: [{ nome: medicamento, dosagem, instrucoes }],
    observacoes: "",
  };

  console.log('VAI ENTRAR NO TRY');
  try {
    const response = await fetch('/medicos/receitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receita),
    });

    if (response.ok) {
      alert('Receita enviada com sucesso!');
      closeModal('modal-receita');
    } else {
      alert('Erro ao enviar receita.');
    }
  } catch (error) {
    console.error('Erro ao enviar receita:', error);
    alert('Erro ao enviar receita. Tente novamente mais tarde.');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  modal.style.display = 'none';
}

// ===========================================================================================================================

function preencherConsultasMedico(consultas) {
  // Verifica se as consultas são um array válido
  if (!Array.isArray(consultas)) {
    console.error("Consultas inválidas ou não recebidas:", consultas);
    return; // Se não for um array válido, interrompe a execução da função
  }

  const container = document.getElementById("consultas-container-medico");
  const semConsultasMsg = document.getElementById("sem-consultas-medico");

  if (!container) {
    console.error("Elemento 'consultas-container-medico' não encontrado.");
    return; // Verifica se o container está presente na página
  }

  // Limpa o conteúdo antes de preencher
  container.innerHTML = '';

  if (consultas.length === 0) {
    // Se não houver consultas, mostra a mensagem de "sem consultas"
    semConsultasMsg.classList.remove('d-none');
    container.classList.add('d-none');
  } else {
    // Se houver consultas, esconde a mensagem e exibe o container
    semConsultasMsg.classList.add('d-none');
    container.classList.remove('d-none');

    consultas.forEach((consulta, index) => {
      const paciente = consulta.nomePaciente || "Paciente não disponível";
      const data = consulta.data || "Data não informada";
      const hora = consulta.hora || "Hora não informada";
      const motivo = consulta.motivo || "Motivo não informado";
      const status = consulta.status || "Status não informado";

      // Cria o novo elemento para cada consulta
      const consultaElement = document.createElement("div");
      consultaElement.classList.add("col-lg-4", "col-md-6", "d-flex", "align-items-stretch");  // Alterado para 'col-lg-4' e 'col-md-6'

      consultaElement.innerHTML = `
        <div class="icon-box" data-aos-delay="${(index + 1) * 100}">
          <i class="bi bi-calendar-check"></i>
          <h4>Paciente: ${paciente}</h4>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Status:</strong> ${status}</p>
          <div class="d-flex mt-3">
            <button class="btn btn-cancelar" onclick="cancelarConsultaMedico('${consulta._id}', this.closest('.col-lg-4'))">Cancelar</button>
            <button class="btn btn-remarcar" onclick="openRemarcarModalMedico('${consulta._id}')">Remarcar</button>
            <button class="btn btn-receita" onclick="openCriarReceitaModal('${consulta._id}', '${paciente}')">Criar Receita</button>
          </div>
        </div>
      `;

      // Adiciona o novo elemento ao container
      container.appendChild(consultaElement);
    });
  }
}

// ==================================================================================================================================

// Função para abrir o modal de adicionar horário disponível
function openAddHorarioModal() {
  document.getElementById("adicionarHorarioModal").style.display = "flex";

  // Define a data mínima para o calendário como a data atual
  const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  document.getElementById("data-horario").min = today;
}

// Função para adicionar horário disponível
async function adicionarHorario() {
  const data = document.getElementById("data-horario").value.trim();
  const hora = document.getElementById("hora-horario").value.trim();
  const medicoId = localStorage.getItem('idMedico'); // Recupera o ID do médico

  // Validação básica
  if (!data || !hora) {
    alert('Preencha todos os campos antes de adicionar o horário.');
    return;
  }

  if (!medicoId) {
    alert('Erro: Médico não identificado. Faça login novamente.');
    return;
  }

  try {
    const response = await fetch('/medicos/adicionar-horario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, hora, medicoId }),
    });

    if (response.ok) {
      alert('Horário adicionado com sucesso!');
      closeAddHorarioModal();
    } else {
      const error = await response.json();
      alert(`Erro ao adicionar horário: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao adicionar horário:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

// Função para fechar o modal de adicionar horário
function closeAddHorarioModal() {
  document.getElementById("adicionarHorarioModal").style.display = "none";
}

// ==================================================================================================================================

let horarioSelecionado = null; // Para armazenar o horário selecionado

// Função para abrir o modal e carregar os horários disponíveis
async function openRemoveHorarioModal() {
  const medicoId = localStorage.getItem('idMedico');
  if (!medicoId) {
    alert('Erro: Médico não identificado. Faça login novamente.');
    return;
  }

  try {
    // Busca os horários disponíveis do médico
    const response = await fetch(`/medicos/horarios?medicoId=${medicoId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar horários disponíveis.');
    }

    const horarios = await response.json();

    // Limpa a lista de horários no modal
    const listaHorarios = document.getElementById('lista-horarios-disponiveis');
    listaHorarios.innerHTML = '';

    if (horarios.length === 0) {
      listaHorarios.innerHTML = '<li>Não há horários disponíveis para remover.</li>';
    } else {
      horarios.forEach(horario => {
        const li = document.createElement('li');
        li.textContent = moment(horario.dataHora).format('DD/MM/YYYY, HH:mm:ss');
        li.dataset.id = horario._id;
        li.onclick = () => selecionarHorario(li);

        // Adiciona um ícone de "disponível"
        const statusIcon = document.createElement('span');
        statusIcon.style.marginLeft = '10px';

        li.appendChild(statusIcon);
        listaHorarios.appendChild(li);
      });
    }

    // Exibe o modal
    document.getElementById('removerHorarioModal').style.display = 'flex';
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
    alert('Erro ao carregar horários disponíveis.');
  }
}

// Função para fechar o modal
function closeRemoveHorarioModal() {
  document.getElementById('removerHorarioModal').style.display = 'none';
  document.getElementById('confirmacao-remocao').style.display = 'none';
  horarioSelecionado = null;
}

// Função para selecionar um horário
function selecionarHorario(element) {
  // Remover a classe 'selected' de todos os horários
  const horarios = document.querySelectorAll('#lista-horarios-disponiveis li');
  horarios.forEach(h => h.classList.remove('selected'));

  // Adicionar a classe 'selected' ao item clicado
  element.classList.add('selected');
  horarioSelecionado = element.dataset.id; // Armazena o ID do horário

  // Exibe a confirmação de remoção
  document.getElementById('confirmacao-remocao').style.display = 'block';
}

async function confirmarRemocao() {
  if (!horarioSelecionado) {
    alert('Nenhum horário selecionado.');
    return;
  }

  const medicoId = localStorage.getItem('idMedico');
  if (!medicoId) {
    alert('Erro: Médico não identificado. Faça login novamente.');
    return;
  }

  // Extraia a data e a hora do horário selecionado, se necessário.
  const horarioElement = document.querySelector(`li[data-id="${horarioSelecionado}"]`);
  if (!horarioElement) {
    alert('Erro ao identificar o horário.');
    return;
  }

  const [dataFormatada, hora] = horarioElement.textContent.split(', '); // Formato: DD/MM/YYYY, HH:mm:ss
  const [dia, mes, ano] = dataFormatada.split('/'); // Quebra a data no formato DD/MM/YYYY
  const data = `${ano}-${mes}-${dia}`; // Reorganiza para o formato esperado: YYYY-MM-DD  

  try {
    const horaFormatada = hora.split(':').slice(0, 2).join(':'); // Remove os segundos, se houver
    const response = await fetch('medicos/remover-horario', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ medicoId, data, hora: horaFormatada }), // Envia os dados formatados
    });

    if (response.ok) {
      alert('Horário removido com sucesso.');
      closeRemoveHorarioModal();
    } else {
      const error = await response.json();
      alert(`Erro ao remover horário: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao remover horário:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

// Função para cancelar a remoção
function cancelarRemocao() {
  document.getElementById('confirmacao-remocao').style.display = 'none';
  horarioSelecionado = null;
}

// ==================================================================================================================================

document.getElementById('logoutBtn').addEventListener('click', function () {
  const confirmLogout = confirm("Tem certeza que deseja sair?");
  if (confirmLogout) {
    // Remova qualquer dado armazenado no localStorage
    localStorage.removeItem('idPaciente');
    localStorage.removeItem('nomePaciente');
    localStorage.removeItem('idMedico');
    localStorage.removeItem('nomeMedico');

    // Enviar requisição para o backend (opcional, se usar sessões)
    fetch('/logout', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          // Redirecionar para a página de login
          window.location.href = '/';
        } else {
          alert('Erro ao tentar sair. Tente novamente.');
        }
      })
      .catch(error => {
        console.error('Erro ao realizar logout:', error);
        alert('Erro na conexão com o servidor.');
      });
  }
});

// ==================================================================================================================================