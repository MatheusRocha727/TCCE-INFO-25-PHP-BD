//   <script src="./Finanças Residenciais save2_files/bootstrap.bundle.min.js.baixados"></script>
//   <!-- libs para PDF e gráficos -->
//   <script src="./Finanças Residenciais save2_files/jspdf.umd.min.js.baixados"></script>
//   <script src="./Finanças Residenciais save2_files/jspdf.plugin.autotable.min.js.baixados"></script>
//   <script src="./Finanças Residenciais save2_files/chart.umd.min.js.baixados"></script>


    // ===== Utilidades =====
    const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const fmtPct  = (v) => (isFinite(v) ? (v*100).toFixed(1).replace('.', ',') + '%' : '—');
    const parseMoney = (str) => {
      if (!str) return 0;
      str = (''+str).trim().replace(/\s/g,'').replace(/\./g,'').replace(',', '.');
      const n = parseFloat(str);
      return isNaN(n) ? 0 : n;
    }
    const parsePercent = (str) => parseMoney(str) / 100;

    // debounce para evitar re-render frenético
    const debounce = (fn, ms=200) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

    // Tema
    const themeToggle = document.getElementById('themeToggle');
    const setTheme = (dark) => document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    themeToggle.addEventListener('change', (e)=> setTheme(e.target.checked));

    // ===== Orçamento =====
    const tabela = document.getElementById('tabelaDespesas').querySelector('tbody');
    const totalDespesasEl = document.getElementById('totalDespesas');
    const rendaEl = document.getElementById('renda');
    const saldoEl = document.getElementById('saldo');
    const saldoHintEl = document.getElementById('saldoHint');
    const taxaPoupancaEl = document.getElementById('taxaPoupanca');
    const reservaEl = document.getElementById('reserva');

    const rendaResumo = document.getElementById('rendaResumo');
    const despesasResumo = document.getElementById('despesasResumo');
    const saldoResumo = document.getElementById('saldoResumo');
    const dtiResumo = document.getElementById('dtiResumo');

    const addRow = (tipo='Fixa', desc='', val='')=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <select class="form-select tipo">
            <option ${tipo==='Fixa'?'selected':''}>Fixa</option>
            <option ${tipo==='Variável'?'selected':''}>Variável</option>
          </select>
        </td>
        <td><input type="text" class="form-control desc" placeholder="Ex.: Aluguel / Mercado" value="${desc}"></td>
        <td><input type="text" class="form-control money valor" placeholder="0,00" value="${val}"></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger remover"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tabela.appendChild(tr);
    };

    // Linhas iniciais
    addRow('Fixa','Aluguel','');
    addRow('Fixa','Luz','');
    addRow('Fixa','Água','');
    addRow('Variável','Mercado','');
    addRow('Variável','Transporte','');

    const calcTotais = ()=>{
      let total = 0;
      const linhas = [...tabela.querySelectorAll('tr')];
      linhas.forEach(tr=>{
        const val = parseMoney(tr.querySelector('.valor').value);
        total += val;
      });
      totalDespesasEl.textContent = fmtBRL(total);
      const renda = parseMoney(rendaEl.value);
      const saldo = renda - total;
      saldoEl.textContent = fmtBRL(saldo);
      saldoResumo.textContent = fmtBRL(saldo);
      rendaResumo.textContent = fmtBRL(renda);
      despesasResumo.textContent = fmtBRL(total);

      const dti = renda > 0 ? (total / renda) : 0;
      dtiResumo.textContent = fmtPct(dti);

      const taxaPoupa = renda > 0 ? (Math.max(0, saldo)/renda) : 0;
      taxaPoupancaEl.textContent = fmtPct(taxaPoupa);

      const reserva = total * 3;
      reservaEl.textContent = fmtBRL(reserva);

      saldoHintEl.textContent = saldo < 0 ? 'Atenção: saldo negativo.' :
        (saldo === 0 ? 'Saldo zerado.' : 'Bom! Há sobra para poupança.');
    };

    document.getElementById('addFixa').addEventListener('click', ()=> addRow('Fixa','',''));
    document.getElementById('addVariavel').addEventListener('click', ()=> addRow('Variável','',''));
    document.getElementById('btnCalcularOrcamento').addEventListener('click', calcTotais);
    document.getElementById('btnLimpar').addEventListener('click', ()=>{
      rendaEl.value = '';
      tabela.innerHTML = '';
      addRow('Fixa','Aluguel','');
      addRow('Fixa','Luz','');
      addRow('Fixa','Água','');
      addRow('Variável','Mercado','');
      addRow('Variável','Transporte','');
      calcTotais();
      savePeriodo(competenciaEl.value); // snapshot “limpo”
    });

    // Remover linha
    document.addEventListener('click', (e)=>{
      if (e.target.closest('.remover')) {
        e.target.closest('tr').remove();
        calcTotais();
        savePeriodo(competenciaEl.value);
      }
    });

    // ===== Competência + persistência =====
    const competenciaEl = document.getElementById('competencia');
    const competenciaHintEl = document.getElementById('competenciaHint');

    const getCurrentYYYYMM = () => {
      const d = new Date();
      const m = String(d.getMonth()+1).padStart(2,'0');
      return `${d.getFullYear()}-${m}`;
    };
    const getYYYYMMPrev = (yyyyMM) => {
      const [y,m] = yyyyMM.split('-').map(Number);
      const d = new Date(y, m-2, 1);
      const mm = String(d.getMonth()+1).padStart(2,'0');
      return `${d.getFullYear()}-${mm}`;
    };
    const lsKey = (yyyyMM) => `fr:v2:${yyyyMM}`;

    const snapshotFromUI = () => {
      const despesas = [...tabela.querySelectorAll('tr')].map(tr => ({
        tipo: tr.querySelector('.tipo').value,
        desc: tr.querySelector('.desc').value,
        valor: tr.querySelector('.valor').value
      }));
      return { renda: rendaEl.value || '', despesas };
    };

    const loadSnapshotToUI = (snap) => {
      tabela.innerHTML = '';
      rendaEl.value = snap?.renda || '';
      (snap?.despesas?.length ? snap.despesas : [
        {tipo:'Fixa',desc:'Aluguel',valor:''},
        {tipo:'Fixa',desc:'Luz',valor:''},
        {tipo:'Fixa',desc:'Água',valor:''},
        {tipo:'Variável',desc:'Mercado',valor:''},
        {tipo:'Variável',desc:'Transporte',valor:''},
      ]).forEach(r => addRow(r.tipo, r.desc, r.valor));
      calcTotais();
    };

    // ===== ADD-ONS: Relatórios (PDF) e Gráficos =====
    const allCompetencias = () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('fr:v2:'));
      return keys.map(k => k.split(':').pop()).sort();
    };
    const getSnapshot = (yyyyMM) => {
      const raw = localStorage.getItem(lsKey(yyyyMM));
      return raw ? JSON.parse(raw) : null;
    };
    const resumoPeriodo = (yyyyMM) => {
      const snap = getSnapshot(yyyyMM);
      if (!snap) return { renda:0, despesas:0, saldo:0, fixas:0, variaveis:0 };
      const renda = parseMoney(snap.renda);
      let despesas = 0, fixas = 0, variaveis = 0;
      (snap.despesas||[]).forEach(d => {
        const v = parseMoney(d.valor);
        despesas += v;
        if ((d.tipo||'').toLowerCase().startsWith('fixa')) fixas += v; else variaveis += v;
      });
      const saldo = renda - despesas;
      return { renda, despesas, saldo, fixas, variaveis };
    };

    // Selects (PDF e Pizza) — preservando seleção do pizza
    const populatePeriodoSelects = () => {
      const meses = allCompetencias();
      const selPdf = document.getElementById('relatorioMesSelect');
      const selChart = document.getElementById('chartMesSelect');
      const currentChartVal = selChart?.value || competenciaEl.value;

      const makeOpts = (sel) => {
        if (!sel) return;
        sel.innerHTML = '';
        const base = meses.length ? meses : [competenciaEl.value];
        base.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m; opt.textContent = m;
          sel.appendChild(opt);
        });
      };
      makeOpts(selPdf);
      makeOpts(selChart);

      if (selChart && [...selChart.options].some(o => o.value === currentChartVal)) {
        selChart.value = currentChartVal;
      }
    };

    // PDFs
    const { jsPDF } = window.jspdf || {};
    const pdfCabecalho = (doc, titulo) => {
      doc.setFontSize(14); doc.text('Finanças Residenciais', 14, 14);
      doc.setFontSize(11); doc.text(titulo, 14, 22);
    };
    const pdfTabelaDespesas = (doc, snap) => {
      const rows = (snap?.despesas||[]).map(d => [d.tipo||'', d.desc||'', (parseMoney(d.valor)||0).toFixed(2).replace('.',',')]);
      doc.autoTable({ startY: 30, head: [['Tipo','Descrição','Valor (R$)']], body: rows.length? rows : [['—','—','0,00']], styles:{fontSize:9}, headStyles:{fillColor:[13,110,253]} });
    };
    const gerarPdfMes = (yyyyMM) => {
      const snap = getSnapshot(yyyyMM) || { renda:'', despesas:[] };
      const r = resumoPeriodo(yyyyMM);
      const doc = new jsPDF();
      pdfCabecalho(doc, `Relatório do mês ${yyyyMM}`);
      pdfTabelaDespesas(doc, snap);
      let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 40;
      doc.setFontSize(11);
      doc.text(`Renda: ${fmtBRL(r.renda)}`, 14, y); y+=6;
      doc.text(`Despesas: ${fmtBRL(r.despesas)}`, 14, y); y+=6;
      doc.text(`Saldo: ${fmtBRL(r.saldo)}`, 14, y); y+=6;
      const dti = r.renda>0 ? (r.despesas/r.renda) : 0;
      doc.text(`DTI: ${fmtPct(dti)}`, 14, y);
      doc.save(`relatorio_${yyyyMM}.pdf`);
    };
    const gerarPdfGeral = () => {
      const meses = allCompetencias();
      const doc = new jsPDF();
      pdfCabecalho(doc, 'Relatório Geral por competência');
      const base = meses.length? meses : [competenciaEl.value];
      const body = base.map(m => { const r = resumoPeriodo(m); return [m, fmtBRL(r.renda), fmtBRL(r.despesas), fmtBRL(r.saldo), fmtPct(r.renda>0? r.despesas/r.renda : 0)]; });
      doc.autoTable({ startY: 30, head: [['Competência','Renda','Despesas','Saldo','DTI']], body, styles:{fontSize:9}, headStyles:{fillColor:[32,201,151]} });
      doc.save('relatorio_geral.pdf');
    };
    document.getElementById('btnPdfMes')?.addEventListener('click', ()=>{ const sel = document.getElementById('relatorioMesSelect'); gerarPdfMes(sel?.value || competenciaEl.value); });
    document.getElementById('btnPdfGeral')?.addEventListener('click', gerarPdfGeral);

    // Charts
    let barChart, pieChart;
    const renderBar = () => {
      const ctx = document.getElementById('barSaldo'); if (!ctx) return;
      const meses = allCompetencias();
      const axis = meses.length ? meses : [competenciaEl.value];
      const data = axis.map(m => {
        const v = resumoPeriodo(m).saldo;
        return Number.isFinite(v) ? v : 0;
      });
      if (barChart) barChart.destroy();
      barChart = new Chart(ctx, {
        type:'bar',
        data:{ labels: axis, datasets:[{ label:'Saldo', data }] },
        options:{ responsive:true, plugins:{ legend:{ display:false } } }
      });
    };
    const renderPie = () => {
      const ctx = document.getElementById('pieTipo'); if (!ctx) return;
      const m = (document.getElementById('chartMesSelect')?.value) || competenciaEl.value;
      const r = resumoPeriodo(m);
      const fixas = Number.isFinite(r.fixas) ? r.fixas : 0;
      const variaveis = Number.isFinite(r.variaveis) ? r.variaveis : 0;
      if (pieChart) pieChart.destroy();
      pieChart = new Chart(ctx, {
        type:'pie',
        data:{ labels:['Fixas','Variáveis'], datasets:[{ data:[fixas, variaveis] }] },
        options:{ responsive:true }
      });
    };
    const refreshAnalyticsUI = () => { populatePeriodoSelects(); renderBar(); renderPie(); };
    document.getElementById('chartMesSelect')?.addEventListener('change', renderPie);

    // Persistência
    const savePeriodo = (yyyyMM) => {
      try {
        localStorage.setItem(lsKey(yyyyMM), JSON.stringify(snapshotFromUI()));
        competenciaHintEl.textContent = `Salvo em ${new Date().toLocaleString('pt-BR')}`;
        refreshAnalyticsUI(); // sincronia dos gráficos/selects
      } catch(e){}
    };

    const loadPeriodo = (yyyyMM) => {
      const raw = localStorage.getItem(lsKey(yyyyMM));
      if (raw) {
        loadSnapshotToUI(JSON.parse(raw));
        competênciaHintEl?.textContent; // no-op; manter compatibilidade
        competenciaHintEl.textContent = 'Dados carregados deste período.';
      } else {
        loadSnapshotToUI(null);
        competenciaHintEl.textContent = 'Novo período. Insira dados ou duplique do mês anterior.';
      }
      refreshAnalyticsUI(); // refaz dashboards ao trocar período
    };

    // Exportar CSV
    document.getElementById('btnExportar').addEventListener('click', ()=>{
      const renda = parseMoney(rendaEl.value);
      const comp = competenciaEl.value || getCurrentYYYYMM();
      let csv = `Competência,${comp}\n`;
      csv += 'Categoria,Descrição,Valor (R$)\n';
      [...tabela.querySelectorAll('tr')].forEach(tr=>{
        const tipo = tr.querySelector('.tipo').value;
        const desc = (tr.querySelector('.desc').value || '').replace(/,/g,';');
        const val  = parseMoney(tr.querySelector('.valor').value).toFixed(2).replace('.',',');
        csv += `${tipo},${desc},${val}\n`;
      });
      csv += `\nRenda,,${renda.toFixed(2).replace('.',',')}\n`;
      const total = parseMoney(totalDespesasEl.textContent.replace(/[^\d,.-]/g,''));
      csv += `Despesas Totais,,${total.toFixed(2).replace('.',',')}\n`;
      const saldo = renda - total;
      csv += `Saldo,,${saldo.toFixed(2).replace('.',',')}\n`;

      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orcamento_${comp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Ano footer
    document.getElementById('ano').textContent = new Date().getFullYear();

    // Bootstrap inicial: competência atual
    competenciaEl.value = getCurrentYYYYMM();
    loadPeriodo(competenciaEl.value);

    // Troca de competência
    competenciaEl.addEventListener('change', () => {
      const prev = competenciaEl.dataset.last || competenciaEl.value;
      savePeriodo(prev);
      competenciaEl.dataset.last = competenciaEl.value;
      loadPeriodo(competenciaEl.value);
    });

    // Duplicar do mês anterior
    document.getElementById('btnDuplicarPeriodo').addEventListener('click', () => {
      const atual = competenciaEl.value || getCurrentYYYYMM();
      const anterior = getYYYYMMPrev(atual);
      const raw = localStorage.getItem(lsKey(anterior));
      if (!raw) {
        competenciaHintEl.textContent = 'Sem dados no mês anterior para duplicar.';
        return;
      }
      const snap = JSON.parse(raw);
      loadSnapshotToUI(snap);
      savePeriodo(atual);
      competenciaHintEl.textContent = `Dados duplicados de ${anterior}.`;
      refreshAnalyticsUI();
    });

    // Recalcular + salvar quando valores mudarem (debounced)
    const onUiChange = debounce(() => {
      calcTotais();
      savePeriodo(competenciaEl.value);
    }, 200);

    document.addEventListener('input', (e)=>{
      if (e.target.matches('#renda, .valor, .desc, .tipo')) {
        onUiChange();
      }
    });

    // bootstrap inicial dos dashboards
    refreshAnalyticsUI();

	// <![CDATA[  <-- For SVG support
	if ('WebSocket' in window) {
		(function () {
			function refreshCSS() {
				var sheets = [].slice.call(document.getElementsByTagName("link"));
				var head = document.getElementsByTagName("head")[0];
				for (var i = 0; i < sheets.length; ++i) {
					var elem = sheets[i];
					var parent = elem.parentElement || head;
					parent.removeChild(elem);
					var rel = elem.rel;
					if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
						var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
						elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
					}
					parent.appendChild(elem);
				}
			}
			var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			var address = protocol + window.location.host + window.location.pathname + '/ws';
			var socket = new WebSocket(address);
			socket.onmessage = function (msg) {
				if (msg.data == 'reload') window.location.reload();
				else if (msg.data == 'refreshcss') refreshCSS();
			};
			if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
				console.log('Live reload enabled.');
				sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
			}
		})();
	}
	else {
		console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
	}
	// ]]>

  
 