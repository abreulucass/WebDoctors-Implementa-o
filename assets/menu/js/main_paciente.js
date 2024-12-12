(function () {
  /* Chama a função para carregar as consultas na página principal da página do paciente/medico.*/
  document.addEventListener('DOMContentLoaded', () => {
    const idPaciente = localStorage.getItem('idPaciente');
    if (idPaciente) {
      carregarConsultasPaciente(); // Chama a função ao carregar a página
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

// ========================================================================================================================

// ===================================================== PACIENTE =========================================================

// Função para abrir o modal Marcar consulta
function openModal() {
  const modal = document.getElementById("marcarConsultaModal");

  if (!modal) {
    console.error('Modal não encontrado no DOM.');
    return;
  }

  // Reseta o conteúdo do modal ao abrir
  modal.style.display = "flex";

  // Limpa campos
  document.getElementById("especialidade").value = "";
  document.getElementById("medico").innerHTML = '<option value="" disabled selected>Selecione um médico</option>';
  document.getElementById("horario").innerHTML = '<option value="" disabled selected>Selecione um horário</option>';
  document.getElementById("horario").disabled = true;
  document.getElementById("motivo").value = "";

  // Restaura o nome do paciente
  const nomePaciente = localStorage.getItem('nomePaciente');
  if (nomePaciente && nomePaciente !== 'null' && nomePaciente !== '') {
    document.getElementById("nome-paciente").value = nomePaciente;
    document.getElementById("nome-paciente").disabled = true;
  } else {
    console.error('Nome do paciente não encontrado no localStorage.');
  }

  // Recarrega especialidades
  carregarEspecialidades();
}

// Função para carregar especialidades do banco de dados
async function carregarEspecialidades() {
  try {
    const response = await fetch('/medicos/especialidades');
    if (!response.ok) {
      console.log('Entrando no if (!response.ok)...');
      throw new Error('Erro ao buscar especialidades');
    }
    const especialidades = await response.json();
    console.log('Especialidades carregadas:', especialidades); // Log para verificar o retorno

    const especialidadeSelect = document.getElementById("especialidade");
    especialidadeSelect.innerHTML = '<option value="" disabled selected>Selecione uma especialidade</option>';

    // Atualização da função carregarEspecialidades
    especialidades.forEach(especialidade => {
      const option = document.createElement('option');
      option.value = especialidade;  // Usando o valor da especialidade corretamente
      option.textContent = especialidade; // Alterando para usar o nome
      especialidadeSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar especialidades:', error);
    alert('Erro ao carregar especialidades');
  }
}

// Evento disparado ao selecionar uma especialidade
function especialidadeSelecionada(especialidadeId) {
  console.log('Especialidade selecionada:', especialidadeId);
  if (especialidadeId) {
    const medicoSelect = document.getElementById("medico");
    medicoSelect.disabled = false;
    carregarMedicos(especialidadeId); // Passando o ID selecionado
  }
}

// Função para carregar médicos com base na especialidade selecionada
async function carregarMedicos(especialidadeId) {
  console.log(`Carregando médicos para especialidade: ${especialidadeId}`);

  try {
    console.log('Entrando no try...');
    const response = await fetch(`/medicos/medicos?especialidadeId=${especialidadeId}`);

    if (!response.ok) {
      console.log('Entrando no if (!response.ok) função carregar medicos...');
      throw new Error('Erro ao buscar médicos');
    }

    const medicos = await response.json();

    const medicoSelect = document.getElementById("medico");
    medicoSelect.innerHTML = '<option value="" disabled selected>Selecione um médico</option>';

    medicos.forEach(medico => {
      const option = document.createElement('option');
      option.value = medico._id;  // Usando o _id do médico
      option.textContent = medico.nome;
      medicoSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar médicos:', error);
    alert('Erro ao carregar médicos');
  }
}

// Evento disparado ao selecionar um médico
function medicoSelecionado(medicoId) {
  console.log('Médico selecionado:', medicoId);
  if (medicoId) {
    const horarioSelect = document.getElementById("horario");
    horarioSelect.disabled = false;
    carregarHorarios(medicoId); // Carregar horários disponíveis para o médico selecionado
  }
}

// Função para carregar horários do médico selecionado
async function carregarHorarios(medicoId) {
  try {
    const response = await fetch(`/medicos/horarios?medicoId=${medicoId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar horários');
    }
    const horarios = await response.json();
    console.log('Horários recebidos:', horarios); // Debug

    const horarioSelect = document.getElementById("horario");
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
    console.error('Erro ao carregar horários:', error);
    alert('Erro ao carregar horários');
  }
}

// Função para marcar consulta
async function marcarConsulta() {
  // Coleta os valores do modal
  const nomePaciente = document.getElementById("nome-paciente").value.trim();
  const especialidade = document.getElementById("especialidade").value;
  const nomeMedico = document.getElementById("medico").options[document.getElementById("medico").selectedIndex].text;
  const dataHora = document.getElementById("horario").value;
  const motivo = document.getElementById("motivo").value.trim();

  // Validação básica
  if (!nomePaciente || !especialidade || !nomeMedico || !dataHora || !motivo) {
    alert('Preencha todos os campos antes de confirmar a consulta.');
    return;
  }

  const [data, hora] = dataHora.split('T'); // Divide o timestamp em data e hora

  // Monta o objeto para enviar ao backend
  const consulta = {
    nomePaciente,
    nomeMedico,
    data,
    hora,
    motivo,
    status: 'Agendada',
  };

  try {
    const response = await fetch('/marcar-consulta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consulta),
    });

    if (response.ok) {
      alert('Consulta marcada com sucesso!');
      closeModal(); // Fecha o modal
      carregarConsultasPaciente(); // Chama a função ao carregar a página
    } else {
      const error = await response.text();
      alert(`Erro ao marcar consulta: ${error}`);
    }
  } catch (error) {
    console.error('Erro ao marcar consulta:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

// Adicionando o evento de fechamento ao clicar no "x"
document.addEventListener('DOMContentLoaded', function () {
  const closeButton = document.querySelector('.close-btn');  // Seleciona o botão de fechar
  const modal = document.getElementById('marcarConsultaModal'); // Seleciona o modal

  closeButton.onclick = function () {
    modal.style.display = 'none';  // Fecha o modal ao clicar no "x"
  };
});

// Função para fechar o modal Marcar consulta
function closeModal() {
  const modal = document.getElementById("marcarConsultaModal");
  if (modal) {
    modal.style.display = "none";
    console.log("Modal de marcar consulta fechado.");
  }
}

// ===================================================================================================================

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

// Função para abrir o modal e carregar consultas
async function openRemarcarModal(idConsulta) {
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
        <label for="especialidade">Especialidade:</label>
        <input type="text" id="especialidade" value="${consulta.medicoId?.especialidade || 'Especialidade não informada'}" disabled>
        <label for="medico">Médico:</label>
        <input type="text" id="medico" value="${consulta.nomeMedico || 'Médico não informado'}" disabled>
        <label for="horarioRemarcar">Novo Horário:</label>
        <select id="horarioRemarcar" name="horarioRemarcar">
          <option value="" disabled selected>Selecione um horário</option>

        </select>
        <button onclick="remarcarConsulta()">Confirmar</button>
      </div>
    `;
    document.body.appendChild(modalContainer);

    // Exibir o modal
    modalContainer.style.display = "flex";

    // Adicionar evento para fechar modal
    document.getElementById("close-remarcar-modal").onclick = closeRemarcarModal;

    // Aguarde um pequeno intervalo para garantir que o modal foi renderizado
    setTimeout(async () => {
      const horarioSelect = document.getElementById("horario");

      if (horarioSelect) {
        console.log("Elemento select encontrado, carregando horários...");
        await carregarHorariosRemarcar(consulta.medicoId._id); // Certifique-se de que o ID do médico é válido
      } else {
        console.error("Elemento select 'horario' não encontrado no DOM.");
      }
    }, 50);

  } catch (error) {
    console.error("Erro ao abrir modal de remarcar consulta:", error);
    alert("Erro ao abrir modal de remarcar consulta.");
  }
}

async function remarcarConsulta() {
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
      carregarConsultasPaciente(); // Atualiza a lista de consultas do paciente
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

// ===================================================================================================================

async function cancelarConsulta(idConsulta, consultaElement) {
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

// ===================================================================================================================

function openEnviarExame(consultaId) {
  // Exibe o modal
  const modal = document.getElementById('enviarExameModal');
  modal.style.display = 'flex';

  // Adiciona o comportamento de envio ao formulário
  const form = document.getElementById('formEnviarExame');
  form.onsubmit = function (event) {
      event.preventDefault(); // Impede o reload da página
      const fileInput = document.getElementById('exameFile');
      const file = fileInput.files[0];

      if (file) {
          enviarExame(consultaId, file);
      } else {
          alert('Selecione um arquivo antes de enviar.');
      }
  };
}

function closeEnviarExameModal() {
  const modal = document.getElementById('enviarExameModal');
  modal.style.display = 'none';
}

function enviarExame(consultaId, file) {
  const formData = new FormData();
  formData.append('exame', file);
  formData.append('consultaId', consultaId);

  fetch('/enviar-exame', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Exame enviado com sucesso!');
      } else {
          alert('Erro ao enviar o exame: ' + data.message);
      }
      closeEnviarExameModal();
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao enviar o exame.');
  });
}

// ===================================================================================================================

async function carregarConsultasPaciente() {
  const pacienteId = localStorage.getItem('idPaciente'); // Certifique-se de que o pacienteId está no localStorage
  if (!pacienteId) {
    alert("Paciente não identificado. Faça login novamente.");
    window.location.href = "/login"; // Redireciona para o login se não encontrar o pacienteId
    return;
  }
  try {
    // Faz a requisição para o backend para buscar as consultas
    const response = await fetch(`/consultas/paciente/${pacienteId}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar consultas.");
    }

    const consultas = await response.json();
    console.log("Consultas recebidas:", consultas); // Verifique se as consultas são retornadas corretamente
    preencherConsultas(consultas); // Passa as consultas para a função preencher
  } catch (error) {
    console.error("Erro ao carregar consultas:", error);
    //alert("Erro ao carregar consultas. Tente novamente mais tarde.");
  }
}

function preencherConsultas(consultas) {
  // Verifica se as consultas são um array válido
  if (!Array.isArray(consultas)) {
    console.error("Consultas inválidas ou não recebidas:", consultas);
    return; // Se não for um array válido, interrompe a execução da função
  }

  const container = document.getElementById("consultas-container");
  const semConsultasMsg = document.getElementById("sem-consultas");

  if (!container) {
    console.error("Elemento 'consultas-container' não encontrado.");
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
      const medico = consulta.nomeMedico || "Médico não disponível";
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
          <h4> Médico: ${medico}</h4>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Status:</strong> ${status}</p>
          <div class="d-flex mt-3">
            <button class="btn btn-cancelar" onclick="cancelarConsulta('${consulta._id}', this.closest('.col-lg-4'))">Cancelar</button>
            <button class="btn btn-remarcar" onclick="openRemarcarModal('${consulta._id}')">Remarcar</button>
            <button class="btn btn-exame" onclick="openEnviarExame('${consulta._id}')">Enviar Exame</button>
          </div>
        </div>
      `;

      // Adiciona o novo elemento ao container
      container.appendChild(consultaElement);
    });
  }
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