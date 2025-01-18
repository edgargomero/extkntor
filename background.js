let isCollecting = false;
let collectedData = [];
let selectedTexts = [];

console.log('Background script started');

function logState() {
    console.log('Current state:', {
        isCollecting,
        dataCount: collectedData.length,
        selectionsCount: selectedTexts.length
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    
    switch(request.action) {
        case 'startCollection':
            isCollecting = true;
            collectedData = [];
            selectedTexts = [];
            logState();
            sendResponse({ status: 'started' });
            break;

        case 'stopCollection':
            isCollecting = false;
            logState();
            sendResponse({ 
                status: 'stopped', 
                data: [...collectedData, ...selectedTexts]
            });
            break;

        case 'getStatus':
            logState();
            sendResponse({ 
                isCollecting, 
                data: [...collectedData, ...selectedTexts]
            });
            break;

        case 'saveSelection':
            if (isCollecting && sender.tab) {
                selectedTexts.push({
                    title: sender.tab.title,
                    url: sender.tab.url,
                    content: request.text,
                    timestamp: new Date().toISOString(),
                    type: 'selection'
                });
                logState();
                sendResponse({ status: 'saved' });
            }
            break;
    }
    return true;
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (!isCollecting) return;
    
    console.log('New tab activated:', activeInfo);
    
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        
        // Skip chrome:// URLs and other restricted pages
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            console.log('Skipping restricted URL:', tab.url);
            return;
        }
        
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: activeInfo.tabId },
            function: () => {
                const title = document.title;
                const url = window.location.href;
                const mainContent = document.body.innerText.substring(0, 1000);
                
                return {
                    title,
                    url,
                    content: mainContent,
                    timestamp: new Date().toISOString(),
                    type: 'page'
                };
            }
        });
        
        console.log('Content extracted:', result.result);
        collectedData.push(result.result);
        
        chrome.runtime.sendMessage({
            action: 'updateCollectedData',
            data: [...collectedData, ...selectedTexts]
        });
    } catch (error) {
        console.error('Error collecting data:', error);
    }
});