/**
* Template Name: Medilab
* Template URL: https://bootstrapmade.com/medilab-free-medical-bootstrap-theme/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
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

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

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

// Função para abrir o modal Marcar Consulta
function openModal() {
  document.getElementById("marcarConsultaModal").style.display = "flex";
}

// Função para fechar o modal Marcar Consulta
function closeModal() {
  document.getElementById("marcarConsultaModal").style.display = "none";
}

// ===================================================================================

// Função para marcar consulta
async function marcarConsulta(event) {
  event.preventDefault(); // Impedir o envio padrão do formulário

  const nomePaciente = document.getElementById("nomePaciente").value; // Captura o nome do paciente
  const nomeMedico = document.getElementById("nomeMedico").value; // Captura o nome do médico
  const data = document.getElementById("data").value; // Captura a data
  const hora = document.getElementById("hora").value; // Captura a hora
  const motivo = document.getElementById("motivo").value; // Captura o motivo

  const consulta = {
    nomePaciente: nomePaciente, // Armazena o nome do paciente
    nomeMedico: nomeMedico, // Armazena o nome do médico
    data: data, // Armazena a data
    hora: hora, // Armazena a hora
    motivo: motivo, // Armazena o motivo
    status: 'Agendada' // Não está indo como agendado e sim como pendente *corrigir mais tarde
  };

  try {
    const response = await fetch('/marcar-consulta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consulta)
    });

    if (response.ok) {
      alert('Consulta marcada com sucesso!');
      closeModal(); // Fechar o modal se a consulta for marcada
    } else {
      throw new Error('Erro ao marcar consulta');
    }
  } catch (error) {
    console.error(error);
    alert('Erro ao se conectar com o servidor.');
  }
}

// ===================================================================================================================

// Função para abrir o modal e carregar consultas
function openRemarcarModal() {
  carregarConsultas();
  document.getElementById('remarcarConsultaModal').style.display = 'block';
}

// Função para carregar a lista de consultas
async function carregarConsultas() {
  try {
    const response = await fetch('http://localhost:3000/consultas');
    const consultas = await response.json();

    const consultaLista = document.getElementById('consulta-lista');
    consultaLista.innerHTML = ''; // Limpa a lista antes de carregar novas consultas

    consultas.forEach((consulta) => {
      const consultaItem = document.createElement('div');
      consultaItem.classList.add('consulta-item');
      consultaItem.style.display = 'flex';
      consultaItem.style.alignItems = 'center'; // Alinha verticalmente no centro
      consultaItem.style.border = '1px solid #ccc';
      consultaItem.style.padding = '10px';
      consultaItem.style.marginBottom = '10px';
      consultaItem.style.width = '90%'; // Diminui a largura da caixa de consulta

      // Conteúdo da consulta
      const conteudoConsulta = document.createElement('div');
      conteudoConsulta.style.flex = '1'; // O conteúdo ocupa o espaço restante
      conteudoConsulta.innerHTML = `
        <p><strong>Paciente:</strong> ${consulta.nomePaciente}</p>
        <p><strong>Médico:</strong> ${consulta.nomeMedico}</p>
        <p><strong>Data:</strong> ${consulta.data} - <strong>Hora:</strong> ${consulta.hora}</p>
      `;

      // Botão bolinha ao lado da caixa de consulta
      const bolinha = document.createElement('button');
      bolinha.classList.add('selecionar-bolinha');
      bolinha.onclick = () => abrirCampoEdicao(consultaItem, consulta._id, bolinha); // Passa a bolinha como argumento

      consultaItem.appendChild(conteudoConsulta); // Adiciona o conteúdo da consulta
      consultaItem.appendChild(bolinha); // Adiciona a bolinha fora da caixa de consulta

      consultaLista.appendChild(consultaItem); // Adiciona o item completo à lista
    });
  } catch (error) {
    console.error('Erro ao carregar consultas:', error);
  }
}

// Função para abrir o campo de edição para a consulta selecionada
function abrirCampoEdicao(consultaItem, consultaId, bolinha) {
  // Remove a bolinha ao abrir o campo de edição
  bolinha.remove();

  // Remove qualquer campo de edição já existente
  const campoEdicaoExistente = consultaItem.querySelector('.campo-edicao');
  if (campoEdicaoExistente) {
    campoEdicaoExistente.remove();
  }

  // Cria o campo de edição para nova data e hora
  const campoEdicao = document.createElement('div');
  campoEdicao.classList.add('campo-edicao');
  campoEdicao.style.marginTop = '10px';
  campoEdicao.style.display = 'flex';
  campoEdicao.style.flexDirection = 'column'; // Coloca os campos em coluna

  campoEdicao.innerHTML = `
    <label for="novaData">Nova Data:</label>
    <input type="date" id="novaData-${consultaId}">
    <label for="novoHorario">Novo Horário:</label>
    <input type="time" id="novoHorario-${consultaId}">
    <button onclick="salvarAlteracoes('${consultaId}', '${consultaItem}')">Salvar</button>
  `;

  consultaItem.appendChild(campoEdicao); // Adiciona os campos de edição abaixo dos dados da consulta
}

// Função para exibir uma mensagem temporária de sucesso
function mostrarMensagemSucesso(mensagem) {
  const mensagemSucesso = document.createElement('div');
  mensagemSucesso.classList.add('mensagem-sucesso');
  mensagemSucesso.textContent = mensagem;

  // Estiliza a mensagem para que fique visível
  mensagemSucesso.style.position = 'fixed';
  mensagemSucesso.style.top = '20px';
  mensagemSucesso.style.right = '20px';
  mensagemSucesso.style.backgroundColor = '#4CAF50';
  mensagemSucesso.style.color = '#fff';
  mensagemSucesso.style.padding = '10px';
  mensagemSucesso.style.borderRadius = '5px';
  mensagemSucesso.style.zIndex = '1000';

  document.body.appendChild(mensagemSucesso);

  // Remove a mensagem após 3 segundos
  setTimeout(() => {
    mensagemSucesso.remove();
  }, 3000);
}

// Função para salvar as alterações
async function salvarAlteracoes(consultaId) {
  const novaData = document.getElementById(`novaData-${consultaId}`).value;
  const novoHorario = document.getElementById(`novoHorario-${consultaId}`).value;
  console.log("Nova Data:", novaData, "Novo Horário:", novoHorario);

  try {
    const response = await fetch(`http://localhost:3000/consultas/${consultaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        novaData: novaData, // Alinhado com o que o backend espera
        novoHorario: novoHorario // Alinhado com o que o backend espera
      })
    });

    if (response.ok) {
      mostrarMensagemSucesso("Consulta atualizada com sucesso!");
      setTimeout(() => {
        carregarConsultas(); // Atualiza a lista sem recarregar a página
      }, 500);
    } else {
      console.error('Erro ao atualizar consulta. Status:', response.status);
    }
  } catch (error) {
    console.error('Erro ao conectar com o servidor:', error);
  }
}

// Função para fechar o modal e limpar o formulário
function closeRemarcarModal() {
  document.getElementById("remarcarConsultaModal").style.display = "none";
  document.getElementById("remarcarForm").style.display = "none";
  consultaSelecionada = null; // Limpa a seleção ao fechar o modal
}

// ===================================================================================================================

// Função para abrir o modal
function openCancelarModal() {
  carregarConsultasCancelar(); // Chama a função para carregar consultas no modal de cancelamento
  document.getElementById('cancelarConsultaModal').style.display = 'block';
}

// Função para carregar a lista de consultas no modal de cancelamento
async function carregarConsultasCancelar() {
  try {
    const response = await fetch('http://localhost:3000/consultas');
    const consultas = await response.json();

    const consultaLista = document.getElementById('consulta-lista-cancelar');
    consultaLista.innerHTML = ''; // Limpa a lista antes de carregar novas consultas

    consultas.forEach((consulta) => {
      const consultaItem = document.createElement('div');
      consultaItem.classList.add('consulta-item');
      consultaItem.style.display = 'flex';
      consultaItem.style.alignItems = 'center'; // Alinha verticalmente no centro
      consultaItem.style.border = '1px solid #ccc';
      consultaItem.style.padding = '10px';
      consultaItem.style.marginBottom = '10px';
      consultaItem.style.width = '90%'; // Diminui a largura da caixa de consulta

      // Conteúdo da consulta
      const conteudoConsulta = document.createElement('div');
      conteudoConsulta.style.flex = '1'; // O conteúdo ocupa o espaço restante
      conteudoConsulta.innerHTML = `
        <p><strong>Paciente:</strong> ${consulta.nomePaciente}</p>
        <p><strong>Médico:</strong> ${consulta.nomeMedico}</p>
        <p><strong>Data:</strong> ${consulta.data} - <strong>Hora:</strong> ${consulta.hora}</p>
      `;

      // Botão para cancelar a consulta
      const botaoCancelar = document.createElement('button');
      botaoCancelar.innerText = 'Cancelar';
      botaoCancelar.style.marginLeft = '10px'; // Margem entre conteúdo e botão
      botaoCancelar.onclick = () => confirmarCancelamento(consulta._id); // Chama a função de confirmação de cancelamento

      // Adiciona o conteúdo e o botão ao item de consulta
      consultaItem.appendChild(conteudoConsulta);
      consultaItem.appendChild(botaoCancelar);

      // Adiciona o item de consulta à lista de consultas
      consultaLista.appendChild(consultaItem);
    });
  } catch (error) {
    console.error('Erro ao carregar consultas:', error);
  }
}

// Função para confirmar o cancelamento de uma consulta
async function confirmarCancelamento(consultaId) {
  const confirmacao = confirm('Você tem certeza que deseja cancelar esta consulta?');

  if (confirmacao) {
    try {
      const response = await fetch(`http://localhost:3000/consultas/${consultaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Consulta cancelada com sucesso!');
        // Atualiza a lista de consultas no modal após cancelamento
        carregarConsultasCancelar();
      } else {
        alert('Erro ao cancelar a consulta: ' + response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar requisição de cancelamento:', error);
    }
  }
}

// Função para fechar o modal e limpar o formulário
function closeCancelarModal() {
  document.getElementById("cancelarConsultaModal").style.display = "none";
  consultaSelecionada = null; // Limpa a seleção ao fechar o modal
}

// ===================================================================================================================

// Função para abrir o modal Visualizar Consultas
function openVisualizarModal() {
  carregarConsultasVisualizar();
  document.getElementById("visualizarConsultaModal").style.display = "flex";
}

// Função para carregar a lista de consultas no modal de visualização
async function carregarConsultasVisualizar() {
  try {
    const response = await fetch('http://localhost:3000/consultas');
    const consultas = await response.json();

    const consultaLista = document.getElementById('consulta-lista-visualizar');
    consultaLista.innerHTML = ''; // Limpa a lista antes de carregar novas consultas

    consultas.forEach((consulta) => {
      const consultaItem = document.createElement('div');
      consultaItem.classList.add('consulta-item');
      consultaItem.style.display = 'flex';
      consultaItem.style.alignItems = 'center'; // Alinha verticalmente no centro
      consultaItem.style.border = '1px solid #ccc';
      consultaItem.style.padding = '10px';
      consultaItem.style.marginBottom = '10px';
      consultaItem.style.width = '90%'; // Diminui a largura da caixa de consulta

      // Conteúdo da consulta
      const conteudoConsulta = document.createElement('div');
      conteudoConsulta.style.flex = '1'; // O conteúdo ocupa o espaço restante
      conteudoConsulta.innerHTML = `
        <p><strong>Paciente:</strong> ${consulta.nomePaciente}</p>
        <p><strong>Médico:</strong> ${consulta.nomeMedico}</p>
        <p><strong>Data:</strong> ${consulta.data} - <strong>Hora:</strong> ${consulta.hora}</p>`;

      consultaItem.appendChild(conteudoConsulta); // Adiciona o conteúdo ao item
      consultaLista.appendChild(consultaItem); // Adiciona o item à lista
    });
  } catch (error) {
    console.error('Erro ao carregar consultas:', error);
  }
}

// Função para fechar o modal Visualizar Consultas
function closeVisualizarModal() {
  document.getElementById("visualizarConsultaModal").style.display = "none";
}