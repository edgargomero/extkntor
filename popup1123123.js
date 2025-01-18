document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup cargado');
  
  let collectedData = [];
  const collectedContent = document.getElementById('collectedContent');
  const startButton = document.getElementById('startCollection');
  const stopButton = document.getElementById('stopCollection');
  const statusDiv = document.querySelector('.collection-status');
  const responseDiv = document.getElementById('response');
  
  // Prompt por defecto - usando plantilla literal para mantener el formato
  const defaultPrompt = `Genera una cotización personalizada basada en los siguientes parámetros:

1. Encabezado (mantener fijo en todas las cotizaciones):
   - Usar el componente <LogoUploader /> para permitir cargar el logo
   - Incluir la siguiente información de contacto:
     * Nombre: Andreina Corro
     * Cargo: Asesora de Viajes 
     * Email: andreina@kntor.travel

2. Cuerpo de la cotización (personalizar según la solicitud):
   - Detalles del servicio o producto cotizado
   - Precio y términos de pago
   - Tiempos de entrega o fechas relevantes
   - Cualquier otra información pertinente

3. Pie de página (mantener fijo en todas las cotizaciones):
   - Mencionar los beneficios o características generales
   - Incluir información de la agencia:
     * Dirección: Bandera 566, Of. 91 - Santiago
     * Contacto: Consulta disponibilidad y reservas con Andreina Corro • andreina@kntor.travel

Analiza la siguiente información y genera una cotización con este formato: {texto}`;
  
  // Cargar API key y prompt guardados
  chrome.storage.local.get(['apiKey', 'promptTemplate'], (result) => {
    console.log('Configuración cargada');
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    // Si no hay un prompt guardado, usar el default
    document.getElementById('promptTemplate').value = result.promptTemplate || defaultPrompt;
  });
  chrome.storage.local.get(['apiKey', 'promptTemplate'], (result) => {
    console.log('Configuración cargada');
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    // Si no hay un prompt guardado, usar el default
    document.getElementById('promptTemplate').value = result.promptTemplate || defaultPrompt;
  });

  // Verificar estado inicial
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    console.log('Estado inicial:', response);
    if (response) {
      updateCollectionUI(response.isCollecting);
      if (response.data) {
        collectedData = response.data;
        updateCollectedContent();
      }
    }
  });

  // Guardar API key y prompt
  document.getElementById('saveKey').addEventListener('click', () => {
    console.log('Guardando configuración');
    const apiKey = document.getElementById('apiKey').value;
    const promptTemplate = document.getElementById('promptTemplate').value;
    chrome.storage.local.set({ 
      apiKey,
      promptTemplate
    }, () => {
      console.log('Configuración guardada');
      alert('Configuración guardada');
    });
  });

  // Iniciar recolección
  startButton.addEventListener('click', () => {
    console.log('Iniciando recolección');
    chrome.runtime.sendMessage({ action: 'startCollection' }, (response) => {
      console.log('Respuesta de inicio:', response);
      if (response && response.status === 'started') {
        updateCollectionUI(true);
      }
    });
  });

  // Detener recolección y enviar a Claude
  stopButton.addEventListener('click', async () => {
    console.log('Deteniendo recolección');
    chrome.runtime.sendMessage({ action: 'stopCollection' }, async (response) => {
      console.log('Respuesta de detención:', response);
      if (response && response.status === 'stopped') {
        updateCollectionUI(false);
        collectedData = response.data;
        updateCollectedContent();
        
        // Preparar datos para Claude
        const formattedData = collectedData.map(item => `
          Página: ${item.title}
          URL: ${item.url}
          Contenido: ${item.content}
          ---
        `).join('\n');
        
        // Obtener el prompt y enviar a Claude
        const apiKey = document.getElementById('apiKey').value;
        const promptTemplate = document.getElementById('promptTemplate').value;
        const finalPrompt = promptTemplate.replace('{texto}', formattedData);
        
        responseDiv.textContent = 'Procesando con Claude...';
        
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true' // Agregar este encabezado

            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000,
              messages: [{
                role: 'user',
                content: finalPrompt
              }]
            })
          });

          const data = await response.json();
          if (data.content) {
            responseDiv.textContent = data.content[0].text;
          } else {
            responseDiv.textContent = 'Error: ' + JSON.stringify(data);
          }
        } catch (error) {
          responseDiv.textContent = 'Error: ' + error.message;
        }
      }
    });
  });

  // Actualizar UI según estado de recolección
  function updateCollectionUI(isCollecting) {
    console.log('Actualizando UI:', isCollecting);
    startButton.disabled = isCollecting;
    stopButton.disabled = !isCollecting;
    statusDiv.textContent = `Estado: ${isCollecting ? 'Recolectando...' : 'No recolectando'}`;
  }

  // Actualizar contenido recolectado en UI
  function updateCollectedContent() {
    console.log('Actualizando contenido:', collectedData.length, 'items');
    collectedContent.innerHTML = collectedData.map(item => `
      <div class="collected-item">
        <strong>${item.title}</strong><br>
        <small>${item.url}</small>
        <p>${item.content.substring(0, 100)}...</p>
      </div>
    `).join('');
  }

  // Escuchar actualizaciones del background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensaje recibido en popup:', request);
    if (request.action === 'updateCollectedData') {
      collectedData = request.data;
      updateCollectedContent();
    }
  });
});
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    console.log('Estado inicial:', response);
    if (response) {
      updateCollectionUI(response.isCollecting);
      if (response.data) {
        collectedData = response.data;
        updateCollectedContent();
      }
    }
  });

  // Guardar API key
  document.getElementById('saveKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const promptTemplate = document.getElementById('promptTemplate').value;
    chrome.storage.local.set({ 
      apiKey: apiKey,
      promptTemplate: promptTemplate
    }, () => {
      alert('Configuración guardada');
    });
  });

  // Iniciar recolección
  startButton.addEventListener('click', () => {
    console.log('Iniciando recolección');
    chrome.runtime.sendMessage({ action: 'startCollection' }, (response) => {
      console.log('Respuesta de inicio:', response);
      if (response && response.status === 'started') {
        updateCollectionUI(true);
      }
    });
  });

  // Detener recolección y enviar a Claude
  stopButton.addEventListener('click', async () => {
    console.log('Deteniendo recolección');
    chrome.runtime.sendMessage({ action: 'stopCollection' }, async (response) => {
      console.log('Respuesta de detención:', response);
      if (response && response.status === 'stopped') {
        updateCollectionUI(false);
        collectedData = response.data;
        updateCollectedContent();
        
        // Preparar datos para Claude
        const formattedData = collectedData.map(item => `
          Página: ${item.title}
          URL: ${item.url}
          Contenido: ${item.content}
          ---
        `).join('\n');
        
        // Obtener el prompt y enviar a Claude
        const apiKey = document.getElementById('apiKey').value;
        const promptTemplate = document.getElementById('promptTemplate').value;
        const finalPrompt = promptTemplate.replace('{texto}', formattedData);
        
        responseDiv.textContent = 'Procesando con Claude...';
        
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000,
              messages: [{
                role: 'user',
                content: finalPrompt
              }]
            })
          });

          const data = await response.json();
          if (data.content) {
            responseDiv.textContent = data.content[0].text;
          } else {
            responseDiv.textContent = 'Error: ' + JSON.stringify(data);
          }
        } catch (error) {
          responseDiv.textContent = 'Error: ' + error.message;
        }
      }
    });
  });

  // Actualizar UI según estado de recolección
  function updateCollectionUI(isCollecting) {
    console.log('Actualizando UI:', isCollecting);
    startButton.disabled = isCollecting;
    stopButton.disabled = !isCollecting;
    statusDiv.textContent = `Estado: ${isCollecting ? 'Recolectando...' : 'No recolectando'}`;
  }

  // Actualizar contenido recolectado en UI
  function updateCollectedContent() {
    console.log('Actualizando contenido:', collectedData.length, 'items');
    collectedContent.innerHTML = collectedData.map(item => `
      <div class="collected-item">
        <strong>${item.title}</strong><br>
        <small>${item.url}</small>
        <p>${item.content.substring(0, 100)}...</p>
      </div>
    `).join('');
  }

  // Escuchar actualizaciones del background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensaje recibido en popup:', request);
    if (request.action === 'updateCollectedData') {
      collectedData = request.data;
      updateCollectedContent();
    }
  });
