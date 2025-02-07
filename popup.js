document.addEventListener('DOMContentLoaded', () => {
  let collectedData = [];
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const startBtn = document.getElementById('startCollection');
  const stopBtn = document.getElementById('stopCollection');
  const statusSpan = document.getElementById('status');
  const contentDiv = document.getElementById('collectedContent');
  const previewSection = document.getElementById('previewSection');
  const dataPreview = document.getElementById('dataPreview');
  const editDataBtn = document.getElementById('editData');
  const sendToClaudeBtn = document.getElementById('sendToClaude');

  // Cargar API Key guardada
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) apiKeyInput.value = result.apiKey;
  });

  // Guardar API Key
  saveKeyBtn.addEventListener('click', () => {
    chrome.storage.local.set({ apiKey: apiKeyInput.value }, () => {
      alert('API Key saved');
    });
  });

  // Iniciar recolección
  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startCollection' }, (response) => {
      if (response?.status === 'started') {
        updateUI(true);
      }
    });
  });

  // Detener recolección
  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopCollection' }, (response) => {
      if (response?.status === 'stopped') {
        updateUI(false);
        collectedData = response.data || [];
        updateContent();
        showPreview();
      }
    });
  });

  // Actualizar UI según estado
  function updateUI(isCollecting) {
    startBtn.disabled = isCollecting;
    stopBtn.disabled = !isCollecting;
    statusSpan.textContent = isCollecting ? 'Active' : 'Inactive';
    statusSpan.className = isCollecting ? 'text-green-500' : 'text-gray-500';
  }

  // Actualizar contenido mostrado
  function updateContent() {
    contentDiv.innerHTML = collectedData.length ? 
      collectedData.map(item => `
        <div class="p-2 border-b last:border-b-0">
          <div class="font-medium">${item.title}</div>
          <div class="text-sm text-gray-600">${item.url}</div>
          <div class="text-xs text-gray-500 mt-1">
            ${new Date(item.timestamp).toLocaleString()}
          </div>
        </div>
      `).join('') :
      '<div class="p-4 text-center text-gray-500">No data collected yet</div>';
  }

  // Mostrar vista previa
  function showPreview() {
    const formattedData = collectedData.map(item => 
      `Página: ${item.title}\nURL: ${item.url}\nContenido: ${item.content}\n---`
    ).join('\n');
    
    dataPreview.value = formattedData;
    previewSection.classList.remove('hidden');
  }

  // Habilitar edición de datos
  editDataBtn.addEventListener('click', () => {
    dataPreview.readOnly = false;
    dataPreview.focus();
  });

  // Enviar a Claude
  sendToClaudeBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
      alert('Please save your API key first');
      return;
    }

    sendToClaudeBtn.disabled = true;
    sendToClaudeBtn.textContent = 'Sending...';

    try {
      const systemPrompt = `
        You are a React component generator.
        Please follow these guidelines:
        - Use TypeScript
        - Use modern React practices (hooks, functional components)
        - Include proper prop types
        - Add JSDoc comments
        - Follow clean code principles
        - Include error handling
        - Make components reusable
      `;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: dataPreview.value
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.content) {
        dataPreview.value = result.content[0].text;
      } else {
        throw new Error(JSON.stringify(result));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      sendToClaudeBtn.disabled = false;
      sendToClaudeBtn.textContent = 'Send to Claude';
    }
  });

  // Escuchar actualizaciones de datos
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'updateCollectedData') {
      collectedData = request.data;
      updateContent();
    }
  });

  // Obtener estado inicial
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response) {
      updateUI(response.isCollecting);
      collectedData = response.data || [];
      updateContent();
    }
  });

  // Función para limpiar datos
  function cleanCollectedData() {
    collectedData = [];
    updateContent();
    previewSection.classList.add('hidden');
  }

  // Función para exportar datos
  function exportData() {
    const blob = new Blob([JSON.stringify(collectedData)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collected-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }
});